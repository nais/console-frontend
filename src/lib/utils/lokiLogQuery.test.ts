import { describe, expect, it } from 'vitest';
import { buildLokiLogQuery } from './lokiLogQuery';

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

	it('filters selected JSON log levels and includes missing levels as INFO', () => {
		expect(
			buildLokiLogQuery({
				team: 'my-team',
				workload: 'my-app',
				container: 'my-app',
				instances: ['my-app-123'],
				logLevels: ['ERROR', 'INFO']
			})
		).toContain('| json | level=~"(?i)^(?:ERROR|INFO|)$"');
	});

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
