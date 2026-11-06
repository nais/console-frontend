import { buildLokiLogQuery } from '#lib/utils/lokiLogQuery.js';

// CloudNativePG pkg/specs/pods.go GetInstanceName(clusterName, serial): "%s-%v".
// The legacy eight-character hash is part of clusterName, not the CNPG pod suffix.
describe('Postgres physical cluster log scope', () => {
	test.each(['pg-database-main-f222277b', 'adopted-cluster', 'cluster.regex+literal'])(
		'uses exact escaped cluster identity: %s',
		(clusterName) => {
			const query = buildLokiLogQuery({
				team: 'team',
				workload: 'database',
				container: 'postgres',
				postgresClusterName: clusterName,
				instances: []
			});
			const pattern = new RegExp(JSON.parse(query.split('k8s_pod_name=~')[1]));
			for (const serial of [1, 2, 10]) expect(pattern.test(`${clusterName}-${serial}`)).toBe(true);
			for (const name of [
				clusterName,
				`${clusterName}-pooler-abc`,
				`${clusterName}-feature-1`,
				`${clusterName}-1-extra`,
				`other-${clusterName}-1`,
				`${clusterName}2-1`
			])
				expect(pattern.test(name)).toBe(false);
			expect(query).toContain('service_name="database"');
			expect(query).toContain('k8s_container_name=~"^(?:postgres)$"');
		}
	);

	test('intersects instance selection with the fixed cluster boundary', () => {
		const query = buildLokiLogQuery({
			team: 'team',
			workload: 'database',
			container: 'postgres',
			postgresClusterName: 'actual-cluster',
			instances: ['neighbour-1']
		});
		const patterns = [...query.matchAll(/k8s_pod_name=~("(?:\\.|[^"\\])*")/g)].map(
			(match) => new RegExp(JSON.parse(match[1]))
		);
		expect(patterns).toHaveLength(2);
		expect(patterns.every((pattern) => pattern.test('neighbour-1'))).toBe(false);
	});
});
