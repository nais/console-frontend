import type { PrometheusChartQueryInterval } from '#lib/chart/util.js';

type MetricSeries = {
	labels: { name: string; value: string }[];
	values: { value: number }[];
};

export type QueryInsight = {
	key: string;
	database: string;
	user: string;
	queryId: string;
	queryTexts: string[];
	seconds: number;
	calls: number | null;
	meanSeconds: number | null;
	share: number | null;
};

export function postgresQueryInsightsQuery(
	team: string,
	postgres: string,
	branch: string,
	interval: PrometheusChartQueryInterval
) {
	const selector = `namespace=${JSON.stringify(team)},team=${JSON.stringify(team)},postgres=${JSON.stringify(postgres)},branch=${JSON.stringify(branch)},datname="app"`;
	const identity = 'datname,user,queryid';
	const increase = (metric: string) =>
		`sum by (${identity}) (max by (namespace,k8s_cluster_name,pod,${identity}) (increase(${metric}{${selector}}[${interval}])))`;
	const seconds = increase('cnpg_pg_stat_statements_seconds_total');
	const calls = increase('cnpg_pg_stat_statements_calls_total');
	const top = `topk(20, (${seconds}) > 0)`;
	const named = (query: string, name: string) =>
		`label_replace(${query}, "statistic", "${name}", "__name__", ".*")`;

	return [
		named(top, 'seconds'),
		named(`(${calls}) and on (${identity}) (${top})`, 'calls'),
		named(
			`group by (${identity},query) (cnpg_pg_stat_statements_queries_info{${selector}}) and on (${identity}) (${top})`,
			'query'
		),
		named(`sum(${seconds})`, 'total'),
		named(
			`count by (datname) (cnpg_pg_stat_statements_calls_total{${selector}})`,
			'calls_available'
		),
		named(
			`count by (datname) (cnpg_pg_stat_statements_seconds_total{${selector}})`,
			'seconds_available'
		)
	].join(' or ');
}

export function queryInsightsResult(series: readonly MetricSeries[]) {
	const rows = new Map<string, QueryInsight>();
	const callsByKey = new Map<string, number>();
	const queryTextsByKey = new Map<string, Set<string>>();
	const callsAvailable = new Set<string>();
	const secondsAvailable = new Set<string>();
	let total: number | null = null;
	let error: string | null = null;

	for (const item of series) {
		const labels = new Map(item.labels.map(({ name, value }) => [name, value]));
		const value = item.values[0]?.value;
		if (value === undefined || !Number.isFinite(value) || value < 0) {
			error = 'Query statistics contain an invalid metric value.';
			break;
		}
		const statistic = labels.get('statistic');
		if (statistic === 'total') {
			total = value;
			continue;
		}
		const datname = labels.get('datname');
		if (!datname) {
			error = 'Query statistics are missing the database label.';
			break;
		}
		if (statistic === 'calls_available' || statistic === 'seconds_available') {
			if (value > 0) {
				(statistic === 'calls_available' ? callsAvailable : secondsAvailable).add(datname);
			}
			continue;
		}
		const user = labels.get('user');
		const queryId = labels.get('queryid');
		if (
			!user ||
			!queryId ||
			(statistic !== 'seconds' && statistic !== 'calls' && statistic !== 'query')
		) {
			error = 'Query statistics have an unsupported label format.';
			break;
		}
		const key = JSON.stringify([datname, user, queryId]);
		if (statistic === 'query') {
			const query = labels.get('query');
			if (!query?.trim()) {
				error = 'Query text metadata is missing SQL text.';
				break;
			}
			const texts = queryTextsByKey.get(key) ?? new Set<string>();
			texts.add(query);
			queryTextsByKey.set(key, texts);
		} else if (statistic === 'calls') {
			callsByKey.set(key, value);
		} else {
			rows.set(key, {
				key,
				database: datname,
				user,
				queryId,
				queryTexts: [],
				seconds: value,
				calls: null,
				meanSeconds: null,
				share: null
			});
		}
	}

	for (const row of rows.values()) {
		row.queryTexts = [...(queryTextsByKey.get(row.key) ?? [])].sort();
		row.calls = callsByKey.get(row.key) ?? null;
		row.meanSeconds = row.calls !== null && row.calls > 0 ? row.seconds / row.calls : null;
		row.share = total !== null && total > 0 ? row.seconds / total : null;
	}

	const available = rows.size > 0 || (callsAvailable.has('app') && secondsAvailable.has('app'));

	return {
		rows: [...rows.values()].sort((a, b) => b.seconds - a.seconds || a.key.localeCompare(b.key)),
		available,
		error
	};
}

export function queryDuration(seconds: number) {
	if (seconds === 0) return '0 ms';
	if (seconds < 0.001) return '<1 ms';
	if (seconds < 1) return `${(seconds * 1000).toFixed(1)} ms`;
	return `${seconds.toLocaleString('en-GB', { maximumFractionDigits: 2 })} s`;
}
