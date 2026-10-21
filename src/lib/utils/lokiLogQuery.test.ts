import { describe, expect, it } from 'vitest';
import { buildLokiLogQuery } from './lokiLogQuery';
import { getLogLevel } from './logViewer';

describe('buildLokiLogQuery', () => {
	it('filters by team, workload, container and selected instances', () => {
		expect(
			buildLokiLogQuery({
				team: 'my-team',
				workload: 'my-app',
				container: 'my-app',
				instances: ['my-app-123', 'my-app-456']
			})
		).toBe(
			'{service_namespace="my-team",service_name="my-app"} | k8s_container_name=~"^(?:my-app)$" | k8s_pod_name=~"^(?:my-app-123|my-app-456)$"'
		);
	});

	it('escapes regex and string metacharacters in labels', () => {
		expect(
			buildLokiLogQuery({
				team: 'team"one',
				workload: 'app\\one',
				container: 'app.one',
				instances: ['app[one]']
			})
		).toBe(
			'{service_namespace="team\\"one",service_name="app\\\\one"} | k8s_container_name=~"^(?:app\\\\.one)$" | k8s_pod_name=~"^(?:app\\\\[one\\\\])$"'
		);
	});

	it('produces a query that matches no instances when the selection is empty', () => {
		expect(
			buildLokiLogQuery({
				team: 'my-team',
				workload: 'my-app',
				container: 'my-app',
				instances: []
			})
		).toContain('k8s_pod_name=~"^(?:)$"');
	});

	it('filters pod names by an escaped prefix', () => {
		expect(
			buildLokiLogQuery({
				team: 'my-team',
				workload: 'my-postgres',
				container: 'postgres',
				instances: [],
				podNamePrefix: 'pg-my.postgres-'
			})
		).toBe(
			'{service_namespace="my-team",service_name="my-postgres"} | k8s_container_name=~"^(?:postgres)$" | k8s_pod_name=~"^pg-my\\\\.postgres-.+$"'
		);
	});

	it('adds a case-insensitive literal text search', () => {
		expect(
			buildLokiLogQuery({
				team: 'my-team',
				workload: 'my-app',
				container: 'my-app',
				instances: ['my-app-123'],
				search: 'failed (retry)'
			})
		).toContain('|~"(?i)failed \\\\(retry\\\\)"');
	});

	it('limits Postgres logs to the selected branch pod prefix', () => {
		const query = buildLokiLogQuery({
			team: 'my-team',
			workload: 'roger',
			container: 'postgres',
			instances: [],
			podNamePrefix: 'pg-roger-test-'
		});
		expect(query).toContain('k8s_pod_name=~"^pg-roger-test-.+$"');
		const podFilter = query.split('k8s_pod_name=~')[1];
		const podPattern = new RegExp(JSON.parse(podFilter));
		expect(podPattern.test('pg-roger-test-f222277b-1')).toBe(true);
		expect(podPattern.test('pg-roger-test-f222277b-2')).toBe(true);
		expect(podPattern.test('pg-roger-main-bf09717d-1')).toBe(false);
		expect(podPattern.test('pg-roger-testing-f222277b-1')).toBe(false);
	});

	it('filters selected JSON log levels and includes numeric INFO and missing levels', () => {
		expect(
			buildLokiLogQuery({
				team: 'my-team',
				workload: 'my-app',
				container: 'my-app',
				instances: ['my-app-123'],
				logLevels: ['ERROR', 'INFO']
			})
		).toContain('| json | level=~"(?i)^(?:ERROR|50|INFO|30|)$"');
	});

	it.each(['constructor', '__proto__', 'toString', 'hasOwnProperty'])(
		'builds a filter for the custom log level %s',
		(level) => {
			expect(
				buildLokiLogQuery({
					team: 'my-team',
					workload: 'my-app',
					container: 'my-app',
					instances: ['my-app-123'],
					logLevels: [getLogLevel(JSON.stringify({ level }))]
				})
			).toContain(`| json | level=~"(?i)^(?:${level.toUpperCase()})$"`);
		}
	);

	it('does not add a level filter when no levels have been discovered', () => {
		expect(
			buildLokiLogQuery({
				team: 'my-team',
				workload: 'my-app',
				container: 'my-app',
				instances: ['my-app-123'],
				logLevels: []
			})
		).not.toContain('| json');
	});

	it('does not add a level filter when all levels are selected', () => {
		expect(
			buildLokiLogQuery({
				team: 'my-team',
				workload: 'my-app',
				container: 'my-app',
				instances: ['my-app-123']
			})
		).not.toContain('| json');
	});
});
