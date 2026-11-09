import { logDate, type LogRange } from './loki.js';

export function grafanaTimeRangeURL(href: string, range?: LogRange): string {
	if (!range) return href;
	const url = new URL(href);
	url.searchParams.set('from', String(logDate(range.start).getTime()));
	url.searchParams.set('to', String(logDate(range.end).getTime()));
	return url.toString();
}

export function teamLogsURL(
	projectID: string,
	team: string,
	workload: string,
	range?: LogRange
): string {
	const filters = [
		`resource.labels.namespace_name=${JSON.stringify(team)}`,
		`resource.labels.container_name=${JSON.stringify(workload)}`
	];
	if (range) {
		filters.push(
			`timestamp >= "${logDate(range.start).toISOString()}"`,
			`timestamp <= "${logDate(range.end).toISOString()}"`
		);
	}
	return `https://console.cloud.google.com/logs/query;query=${encodeURIComponent(filters.join('\n'))}?project=${encodeURIComponent(projectID)}`;
}
