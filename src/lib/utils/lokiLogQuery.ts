import { PINO_LOG_LEVELS } from './logViewer.js';

type LokiLogQueryOptions = {
	team: string;
	workload: string;
	container: string;
	instances: string[];
	podNamePrefix?: string;
	search?: string;
	logLevels?: string[];
};

function escapeRegex(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function exactMatch(values: string[]): string {
	return JSON.stringify(`^(?:${values.map(escapeRegex).join('|')})$`);
}

export function buildLokiLogQuery({
	team,
	workload,
	container,
	instances,
	podNamePrefix,
	search,
	logLevels
}: LokiLogQueryOptions): string {
	const selectors = [
		`service_namespace=${JSON.stringify(team)}`,
		`service_name=${JSON.stringify(workload)}`
	];
	const labelFilters = [
		`k8s_container_name=~${exactMatch([container])}`,
		`k8s_pod_name=~${
			podNamePrefix === undefined
				? exactMatch(instances)
				: JSON.stringify(`^${escapeRegex(podNamePrefix)}.+$`)
		}`
	];
	let query = `{${selectors.join(',')}} | ${labelFilters.join(' | ')}`;

	if (search?.trim()) {
		query += ` |~${JSON.stringify(`(?i)${escapeRegex(search.trim())}`)}`;
	}

	if (logLevels && logLevels.length > 0) {
		const normalizedLevels = logLevels.map((level) => level.toUpperCase());
		const levels = normalizedLevels.flatMap((level) => {
			const numericLevel = PINO_LOG_LEVELS[level];
			return numericLevel === undefined
				? [escapeRegex(level)]
				: [escapeRegex(level), String(numericLevel)];
		});
		if (normalizedLevels.includes('INFO')) {
			levels.push('');
		}
		query += ` | json | level=~${JSON.stringify(`(?i)^(?:${levels.join('|')})$`)}`;
	}

	return query;
}
