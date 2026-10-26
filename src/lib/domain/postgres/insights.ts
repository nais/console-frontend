import prettyBytes from 'pretty-bytes';

type MetricLabel = { name: string; value: string };

export type PostgresInsightsChart = {
	title: string;
	description: string;
	query: string;
	labelFormatter: (labels: MetricLabel[]) => string;
	formatYValue?: (value: number) => string;
};

type PostgresInsightsSection = {
	id: string;
	title: string;
	charts: PostgresInsightsChart[];
};

const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
const formatBytes = (value: number) => prettyBytes(value, { binary: true });
const formatBytesPerSecond = (value: number) => `${formatBytes(value)}/s`;
const formatRate = (value: number) => `${value.toFixed(2)}/s`;
const seriesLabel = (labels: MetricLabel[]) =>
	labels.find((label) => label.name === 'series')?.value ?? 'Unknown';
const databaseLabel = (labels: MetricLabel[]) =>
	labels.find((label) => label.name === 'datname')?.value || 'Unknown database';
const stateLabel = (labels: MetricLabel[]) =>
	labels.find((label) => label.name === 'state')?.value || 'Unknown state';

export function postgresInsightsSections(
	team: string,
	postgres: string,
	branch: string
): PostgresInsightsSection[] {
	const namespace = `namespace=${JSON.stringify(team)}`;
	const selector = `${namespace},team=${JSON.stringify(team)},postgres=${JSON.stringify(postgres)},branch=${JSON.stringify(branch)}`;
	const podLabels = 'namespace,pod,k8s_cluster_name';
	const pvcLabels = 'namespace,persistentvolumeclaim,k8s_cluster_name';
	const selectedPods = `max by (${podLabels}) (up{${selector}} == 1)`;
	const onBranch = (expression: string) => `(${expression}) and on(${podLabels}) (${selectedPods})`;
	const container = `${namespace},container="postgres",image!=""`;
	const containerSum = (metric: string) =>
		`sum(${onBranch(`sum by (${podLabels}) (${metric}{${container}})`)})`;
	const containerRate = (metric: string) =>
		`sum(${onBranch(`sum by (${podLabels}) (rate(${metric}{${container}}[$__rate_interval]))`)})`;
	const requested = (resource: string, unit: string) =>
		`sum(${onBranch(`sum by (${podLabels}) (kube_pod_container_resource_requests{${namespace},container="postgres",resource="${resource}",unit="${unit}"})`)})`;
	const named = (query: string, name: string) =>
		`label_replace(${query}, "series", "${name}", "__name__", ".*")`;
	const pair = (first: string, firstName: string, second: string, secondName: string) =>
		`${named(first, firstName)} or ${named(second, secondName)}`;
	const branchPvcs = `max by (${pvcLabels}) (kube_pod_spec_volumes_persistentvolumeclaims_info{${namespace},volume="pgdata"} and on(${podLabels}) (${selectedPods}))`;
	const volume = (metric: string) =>
		`sum(max by (${pvcLabels}) (${metric}{${namespace}}) and on(${pvcLabels}) (${branchPvcs}))`;
	const diskUsed = volume('kubelet_volume_stats_used_bytes');
	const diskCapacity = volume('kubelet_volume_stats_capacity_bytes');
	const memoryWorkingSet = containerSum('container_memory_working_set_bytes');
	const memoryRequested = requested('memory', 'byte');
	const connections = `cnpg_pg_stat_activity_count{${selector},backend_type="client backend"}`;
	const primary = `max by (${podLabels}) (cnpg_pg_replication_in_recovery{${selector}} == 0)`;
	const transactionRate = (metric: string) =>
		`sum(rate(${metric}{${selector}}[$__rate_interval]) and on(${podLabels}) (${primary}))`;
	const networkRate = (metric: string) =>
		`sum(${onBranch(`max by (${podLabels},interface) (rate(${metric}{${namespace},container=~"POD|",interface!="lo"}[$__rate_interval]))`)})`;

	return [
		{
			id: 'utilization',
			title: 'Utilization',
			charts: [
				{
					title: 'CPU utilization',
					description: `CPU usage as a percentage of requested CPU across instances in branch ${branch}.`,
					query: `${containerRate('container_cpu_usage_seconds_total')} / clamp_min(${requested('cpu', 'core')}, 0.001)`,
					labelFormatter: () => 'CPU used',
					formatYValue: formatPercentage
				},
				{
					title: 'Memory utilization',
					description: `Memory working set as a percentage of requested memory across instances in branch ${branch}.`,
					query: `${memoryWorkingSet} / clamp_min(${memoryRequested}, 1)`,
					labelFormatter: () => 'Memory used',
					formatYValue: formatPercentage
				},
				{
					title: 'Disk utilization',
					description: `Storage used as a percentage of pgdata volume capacity across instances in branch ${branch}.`,
					query: `${diskUsed} / clamp_min(${diskCapacity}, 1)`,
					labelFormatter: () => 'Disk used',
					formatYValue: formatPercentage
				}
			]
		},
		{
			id: 'memory',
			title: 'Memory',
			charts: [
				{
					title: 'Memory components',
					description: `Resident anonymous memory (RSS) and file cache across instances in branch ${branch}. These are container metrics, not PostgreSQL shared buffer statistics.`,
					query: pair(
						containerSum('container_memory_rss'),
						'RSS',
						containerSum('container_memory_cache'),
						'File cache'
					),
					labelFormatter: seriesLabel,
					formatYValue: formatBytes
				},
				{
					title: 'Total memory usage',
					description: `Total container memory including cache, working set excluding inactive file cache, and requested memory across instances in branch ${branch}. The usage series overlap and should not be added together.`,
					query: `${pair(containerSum('container_memory_usage_bytes'), 'Total usage', memoryWorkingSet, 'Working set')} or ${named(memoryRequested, 'Requested')}`,
					labelFormatter: seriesLabel,
					formatYValue: formatBytes
				}
			]
		},
		{
			id: 'connections',
			title: 'Connections and transactions',
			charts: [
				{
					title: 'Total connections',
					description: `Client connections across primary and replica instances in branch ${branch}. Internal PostgreSQL processes and the metrics exporter's own connection are excluded.`,
					query: `sum(${connections})`,
					labelFormatter: () => 'Client connections'
				},
				{
					title: 'Connections by state',
					description: `Client connections grouped by state across primary and replica instances in branch ${branch}.`,
					query: `sum by (state) (${connections})`,
					labelFormatter: stateLabel
				},
				{
					title: 'Connections per database',
					description: `Client connections grouped by database across primary and replica instances in branch ${branch}.`,
					query: `sum by (datname) (${connections})`,
					labelFormatter: databaseLabel
				},
				{
					title: 'Transactions',
					description: `Commits and rollbacks per second on the primary instance in branch ${branch}, including internal and monitoring transactions. Read-only transactions on replicas are excluded.`,
					query: pair(
						transactionRate('cnpg_pg_stat_database_xact_commit'),
						'Commits',
						transactionRate('cnpg_pg_stat_database_xact_rollback'),
						'Rollbacks'
					),
					labelFormatter: seriesLabel,
					formatYValue: formatRate
				}
			]
		},
		{
			id: 'storage',
			title: 'Storage and I/O',
			charts: [
				{
					title: 'Storage usage',
					description: `Used space and capacity of pgdata volumes across primary and replica instances in branch ${branch}. Includes WAL and other files on these volumes.`,
					query: pair(diskUsed, 'Used', diskCapacity, 'Capacity'),
					labelFormatter: seriesLabel,
					formatYValue: formatBytes
				},
				{
					title: 'Container read/write operations',
					description: `Filesystem reads and writes per second reported for PostgreSQL containers across instances in branch ${branch}. This is container I/O, not a measurement of physical disk IOPS or PostgreSQL buffer reads.`,
					query: pair(
						containerRate('container_fs_reads_total'),
						'Reads',
						containerRate('container_fs_writes_total'),
						'Writes'
					),
					labelFormatter: seriesLabel,
					formatYValue: formatRate
				}
			]
		},
		{
			id: 'network',
			title: 'Network',
			charts: [
				{
					title: 'Data transfer',
					description: `Network bytes received and sent per second across pods in branch ${branch}. Includes replication, backups and monitoring traffic, not just client traffic.`,
					query: pair(
						networkRate('container_network_receive_bytes_total'),
						'Received',
						networkRate('container_network_transmit_bytes_total'),
						'Sent'
					),
					labelFormatter: seriesLabel,
					formatYValue: formatBytesPerSecond
				}
			]
		}
	];
}
