import { postgresInsightsSections } from './insights';

const sections = postgresInsightsSections('my-team', 'my-database');
const charts = sections.flatMap((section) => section.charts);

function chart(title: string) {
	const result = charts.find((candidate) => candidate.title === title);
	if (!result) throw new Error(`Missing chart: ${title}`);
	return result;
}

describe('Postgres Insights queries', () => {
	test('includes all supported Cloud SQL equivalents in uniquely keyed sections', () => {
		expect(sections.map((section) => section.id)).toEqual([
			'utilization',
			'memory',
			'connections',
			'storage',
			'network'
		]);
		expect(charts.map((candidate) => candidate.title)).toEqual([
			'Resource utilization',
			'Memory components',
			'Total memory usage',
			'Total connections',
			'Connections by state',
			'Connections per database',
			'Transactions',
			'Storage usage',
			'Container read/write operations',
			'Data transfer'
		]);
		expect(new Set(charts.map((candidate) => candidate.title)).size).toBe(charts.length);
	});

	test.each(charts)(
		'$title is scoped to the selected team and database without a branch label',
		({ query }) => {
			expect(query).toContain('namespace="my-team"');
			expect(query).toContain('team="my-team"');
			expect(query).toContain('postgres="my-database"');
			expect(query).not.toContain('branch=');
		}
	);

	test('escapes label values without changing their meaning', () => {
		const scoped = postgresInsightsSections('a"b', 'c\\d');
		for (const { query } of scoped.flatMap((section) => section.charts)) {
			expect(query).toContain('namespace="a\\"b"');
			expect(query).toContain('postgres="c\\\\d"');
		}
	});

	test('changing the selected database updates every query', () => {
		const other = postgresInsightsSections('my-team', 'another-database');
		for (const { query } of other.flatMap((section) => section.charts)) {
			expect(query).toContain('postgres="another-database"');
			expect(query).not.toContain('postgres="my-database"');
		}
	});

	test('combines three distinctly labelled utilization ratios without capping percentages', () => {
		const utilization = chart('Resource utilization');
		expect(sections.find((section) => section.id === 'utilization')?.charts).toHaveLength(1);
		expect(utilization.query.match(/\/ clamp_min\(/g)).toHaveLength(3);
		expect(utilization.query.split(' or ')).toHaveLength(3);
		for (const label of ['CPU', 'Memory', 'Disk']) {
			expect(utilization.query).toContain(`"series", "${label}"`);
			expect(utilization.labelFormatter([{ name: 'series', value: label }])).toBe(label);
		}
		for (const metric of [
			'container_cpu_usage_seconds_total',
			'container_memory_working_set_bytes',
			'kube_pod_container_resource_requests',
			'kubelet_volume_stats_used_bytes',
			'kubelet_volume_stats_capacity_bytes'
		]) {
			expect(utilization.query).toContain(metric);
		}
		expect(utilization.query).not.toContain('clamp_max');
		expect(utilization.formatYValue?.(0.125)).toBe('12.5%');
		expect(utilization.formatYValue?.(1.25)).toBe('125.0%');
	});

	test('container metrics join pod identity including the cluster before summing', () => {
		for (const title of [
			'Resource utilization',
			'Memory components',
			'Total memory usage',
			'Container read/write operations',
			'Data transfer'
		]) {
			expect(chart(title).query).toContain('and on(namespace,pod,k8s_cluster_name)');
			expect(chart(title).query).toContain('max by (namespace,pod,k8s_cluster_name) (up{');
		}
	});

	test('only counts client connections using the configured Nais activity metric', () => {
		for (const title of ['Total connections', 'Connections by state', 'Connections per database']) {
			expect(chart(title).query).toContain('cnpg_pg_stat_activity_count{');
			expect(chart(title).query).toContain('backend_type="client backend"');
			expect(chart(title).query).not.toContain('cnpg_backends_total');
		}
		expect(chart('Connections by state').query).toMatch(/^sum by \(state\)/);
		expect(chart('Connections per database').query).toMatch(/^sum by \(datname\)/);
	});

	test('computes transaction rates before aggregation and filters to the primary', () => {
		const query = chart('Transactions').query;
		expect(query).toContain('sum(rate(cnpg_pg_stat_database_xact_commit{');
		expect(query).toContain('sum(rate(cnpg_pg_stat_database_xact_rollback{');
		expect(query).toContain('[$__rate_interval]) and on(namespace,pod,k8s_cluster_name)');
		expect(query).toContain('cnpg_pg_replication_in_recovery{');
		expect(query).toContain('} == 0)');
		expect(query).not.toContain('* on');
		expect(query).toContain('"series", "Commits"');
		expect(query).toContain('"series", "Rollbacks"');
		expect(chart('Transactions').formatYValue?.(1.25)).toBe('1.25/s');
	});

	test('storage is limited to pgdata volumes and deduplicated by PVC and cluster', () => {
		const query = chart('Storage usage').query;
		expect(query).toContain('kube_pod_spec_volumes_persistentvolumeclaims_info{');
		expect(query).toContain('volume="pgdata"');
		expect(query).toContain('max by (namespace,persistentvolumeclaim,k8s_cluster_name)');
		expect(query).toContain('kubelet_volume_stats_used_bytes');
		expect(query).toContain('kubelet_volume_stats_capacity_bytes');
	});

	test('uses container filesystem counters rather than PostgreSQL logical block reads', () => {
		const query = chart('Container read/write operations').query;
		expect(query).toContain('rate(container_fs_reads_total{');
		expect(query).toContain('rate(container_fs_writes_total{');
		expect(query).not.toContain('blks_read');
	});

	test('deduplicates network observations per pod/interface and excludes loopback', () => {
		const query = chart('Data transfer').query;
		expect(query).toContain('max by (namespace,pod,k8s_cluster_name,interface) (rate(');
		expect(query).toContain('container=~"POD|",interface!="lo"');
		expect(query).toContain('container_network_receive_bytes_total');
		expect(query).toContain('container_network_transmit_bytes_total');
		expect(query).not.toContain('image!=');
		expect(chart('Data transfer').formatYValue?.(1024)).toBe('1 KiB/s');
	});

	test('formats memory and storage with the same binary units', () => {
		for (const title of ['Memory components', 'Total memory usage', 'Storage usage']) {
			expect(chart(title).formatYValue?.(1024 ** 3)).toBe('1 GiB');
		}
	});

	test('formats series, database and connection state labels', () => {
		expect(chart('Transactions').labelFormatter([{ name: 'series', value: 'Commits' }])).toBe(
			'Commits'
		);
		expect(
			chart('Connections per database').labelFormatter([{ name: 'datname', value: 'app' }])
		).toBe('app');
		expect(chart('Connections by state').labelFormatter([{ name: 'state', value: 'idle' }])).toBe(
			'idle'
		);
	});
});
