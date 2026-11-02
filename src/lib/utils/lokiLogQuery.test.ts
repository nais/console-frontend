import { describe, expect, it } from 'vitest';
import {
	addLokiLabelFilter,
	buildLokiLogQuery,
	isFilterableLokiLabel,
	type LokiLabelFilter
} from './lokiLogQuery';
import { getLogLevel } from './logViewer';

describe('addLokiLabelFilter', () => {
	const include: LokiLabelFilter = { name: 'detected_level', operator: '=', value: 'info' };
	const exclude: LokiLabelFilter = { ...include, operator: '!=' };

	it('does not duplicate an existing filter or change the array', () => {
		const filters = [include];
		expect(addLokiLabelFilter(filters, { ...include })).toBe(filters);
	});

	it('replaces an inclusion with another value for the same label', () => {
		const next: LokiLabelFilter = { ...include, value: 'error' };
		expect(addLokiLabelFilter([include], next)).toEqual([next]);
	});

	it('replaces the opposite operator for the same value', () => {
		expect(addLokiLabelFilter([include], exclude)).toEqual([exclude]);
		expect(addLokiLabelFilter([exclude], include)).toEqual([include]);
	});

	it('keeps multiple exclusions and filters on other labels', () => {
		const node: LokiLabelFilter = { name: 'k8s_node_name', operator: '=', value: 'node-1' };
		const next: LokiLabelFilter = { ...exclude, value: 'debug' };
		const filters = [exclude, node];
		expect(addLokiLabelFilter(filters, next)).toEqual([exclude, node, next]);
		expect(filters).toEqual([exclude, node]);
	});

	it('preserves exclusions for other values when adding an inclusion', () => {
		const next: LokiLabelFilter = { ...include, value: 'error' };
		expect(addLokiLabelFilter([exclude], next)).toEqual([exclude, next]);
	});

	it('rejects attempts to change workload scope', () => {
		expect(() =>
			addLokiLabelFilter([], { name: 'service_namespace', operator: '=', value: 'other-team' })
		).toThrow('cannot be used as an additional log filter');
	});
});

describe('buildLokiLogQuery', () => {
	it('clears optional JSON parser errors without excluding non-JSON log lines', () => {
		const query = buildLokiLogQuery({
			team: 'my-team',
			workload: 'my-app',
			container: 'my-app',
			logLevels: ['INFO']
		});
		expect(query).toContain('| json | level=~"(?i)^(?:INFO|30|)$"');
		expect(query.endsWith(' | drop __error__, __error_details__')).toBe(true);
		expect(query).not.toContain('| __error__=');
	});

	it('filters stream labels and structured metadata alongside parsed JSON fields', () => {
		const query = buildLokiLogQuery({
			team: 'my-team',
			workload: 'my-app',
			container: 'my-app',
			cluster: 'dev',
			labelFilters: [
				{ name: 'k8s_node_name', operator: '=', value: 'node-1' },
				{ name: 'detected_level', operator: '!=', value: 'info' }
			],
			logLevels: ['ERROR']
		});
		expect(query).toContain(
			'| json | level=~"(?i)^(?:ERROR|50)$" | k8s_node_name="node-1" | detected_level!="info" | drop __error__, __error_details__'
		);
		expect(query).toContain(
			'{service_namespace="my-team",service_name="my-app",k8s_cluster_name="dev"}'
		);
	});

	it.each(['=', '!='] as const)(
		'applies JSON-only field filters with %s after parsing, even without a level filter',
		(operator) => {
			for (const logLevels of [['INFO'], []]) {
				const query = buildLokiLogQuery({
					team: 'my-team',
					workload: 'my-app',
					container: 'my-app',
					logLevels,
					labelFilters: [
						{ name: 'request_id', operator, value: 'request-123' },
						{ name: 'level', operator, value: 'info' }
					]
				});
				expect(query.match(/\| json/g)).toHaveLength(1);
				const filter = ` | request_id${operator}"request-123" | level${operator}"info"`;
				expect(query.indexOf(filter)).toBeGreaterThan(query.indexOf(' | json'));
				expect(query.endsWith(`${filter} | drop __error__, __error_details__`)).toBe(true);
				expect(query).not.toContain('| __error__=');
				if (logLevels.length === 0) expect(query).not.toContain('level=~');
			}
		}
	);

	it('quotes label values literally rather than treating them as LogQL or regex', () => {
		const value = 'a".*\\\n} | detected_level!="info"';
		const query = buildLokiLogQuery({
			team: 'my-team',
			workload: 'my-app',
			container: 'my-app',
			labelFilters: [{ name: 'request_id', operator: '=', value }]
		});
		expect(
			query.endsWith(` | request_id=${JSON.stringify(value)} | drop __error__, __error_details__`)
		).toBe(true);
	});

	it.each([
		'service_namespace',
		'service_name',
		'k8s_cluster_name',
		'k8s_container_name',
		'bad-name',
		'name|json',
		'1name',
		''
	])('rejects scoped or invalid additional label %s', (name) => {
		expect(isFilterableLokiLabel(name)).toBe(false);
		expect(() =>
			buildLokiLogQuery({
				team: 'my-team',
				workload: 'my-app',
				container: 'my-app',
				labelFilters: [{ name, operator: '=', value: 'other' }]
			})
		).toThrow('cannot be used as an additional log filter');
	});

	it('scopes explorer queries by cluster without excluding historical instances', () => {
		const query = buildLokiLogQuery({
			team: 'my-team',
			workload: 'my-app',
			container: 'my-app',
			cluster: 'dev'
		});

		expect(query).toBe(
			'{service_namespace="my-team",service_name="my-app",k8s_cluster_name="dev"} | k8s_container_name=~"^(?:my-app)$"'
		);
	});

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
			'{service_namespace="my-team",service_name="my-postgres"} | k8s_container_name=~"^(?:postgres)$" | k8s_pod_name=~"^pg-my\\\\.postgres-.*$"'
		);
	});

	it.each(['job-run-123', 'job-run-123-abcde'])(
		'matches both the instance value %s and pods with that prefix',
		(instance) => {
			const query = buildLokiLogQuery({
				team: 'my-team',
				workload: 'my-job',
				container: 'my-job',
				podNamePrefix: instance
			});
			const podPattern = new RegExp(JSON.parse(query.split('k8s_pod_name=~')[1]));
			expect(podPattern.test(instance)).toBe(true);
			expect(podPattern.test(`${instance}-pod`)).toBe(true);
			expect(podPattern.test(`other-${instance}`)).toBe(false);
		}
	);

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

	it.each(['test', 'test-feature', 'test.feature'])(
		'matches only the exact Postgres branch %s',
		(branch) => {
			const query = buildLokiLogQuery({
				team: 'my-team',
				workload: 'roger',
				container: 'postgres',
				instances: [],
				podNamePrefix: `pg-roger-${branch}-`,
				exactPostgresBranch: true
			});
			const podFilter = query.split('k8s_pod_name=~')[1];
			const podPattern = new RegExp(JSON.parse(podFilter));
			expect(podPattern.test(`pg-roger-${branch}-f222277b-1`)).toBe(true);
			expect(podPattern.test(`pg-roger-${branch}-f222277b-2`)).toBe(true);
			expect(podPattern.test(`pg-roger-${branch}-feature-f222277b-1`)).toBe(false);
			expect(podPattern.test(`pg-roger-${branch}-f222277b-1-extra`)).toBe(false);
			expect(podPattern.test(`pg-roger-${branch}-f222277b-pooler-abc`)).toBe(false);
			expect(podPattern.test('pg-roger-main-bf09717d-1')).toBe(false);
			expect(podPattern.test('pg-roger-testing-f222277b-1')).toBe(false);
		}
	);

	it('keeps all Postgres branches in the broad prefix filter', () => {
		const query = buildLokiLogQuery({
			team: 'my-team',
			workload: 'roger',
			container: 'postgres',
			instances: [],
			podNamePrefix: 'pg-roger-',
			exactPostgresBranch: false
		});
		const podPattern = new RegExp(JSON.parse(query.split('k8s_pod_name=~')[1]));
		for (const branch of ['main', 'test', 'test-feature']) {
			expect(podPattern.test(`pg-roger-${branch}-f222277b-1`)).toBe(true);
		}
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
