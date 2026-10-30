import { PINO_LOG_LEVELS } from './logViewer.js';

export type LokiLabelFilter = {
	name: string;
	operator: '=' | '!=';
	value: string;
};

const workloadScopeLabels = new Set([
	'service_namespace',
	'service_name',
	'k8s_cluster_name',
	'k8s_container_name'
]);

export function isFilterableLokiLabel(name: string): boolean {
	return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name) && !workloadScopeLabels.has(name);
}

function validateLabelFilter(filter: LokiLabelFilter) {
	if (!isFilterableLokiLabel(filter.name)) {
		throw new Error(`Label "${filter.name}" cannot be used as an additional log filter.`);
	}
	if (filter.operator !== '=' && filter.operator !== '!=') {
		throw new Error('Unsupported log label filter operator.');
	}
}

export function addLokiLabelFilter(
	filters: LokiLabelFilter[],
	next: LokiLabelFilter
): LokiLabelFilter[] {
	validateLabelFilter(next);
	if (
		filters.some(
			(filter) =>
				filter.name === next.name &&
				filter.operator === next.operator &&
				filter.value === next.value
		)
	) {
		return filters;
	}
	return [
		...filters.filter((filter) => {
			if (filter.name !== next.name) return true;
			if (filter.value === next.value) return false;
			return next.operator === '!=' || filter.operator === '!=';
		}),
		next
	];
}

type LokiLogQueryOptions = {
	team: string;
	workload: string;
	container: string;
	instances?: string[];
	cluster?: string;
	podNamePrefix?: string;
	exactPostgresBranch?: boolean;
	search?: string;
	logLevels?: string[];
	labelFilters?: LokiLabelFilter[];
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
	cluster,
	podNamePrefix,
	exactPostgresBranch = false,
	search,
	logLevels,
	labelFilters: additionalFilters = []
}: LokiLogQueryOptions): string {
	const selectors = [
		`service_namespace=${JSON.stringify(team)}`,
		`service_name=${JSON.stringify(workload)}`
	];
	if (cluster !== undefined) selectors.push(`k8s_cluster_name=${JSON.stringify(cluster)}`);
	const labelFilters = [`k8s_container_name=~${exactMatch([container])}`];
	if (instances !== undefined || podNamePrefix !== undefined) {
		labelFilters.push(
			`k8s_pod_name=~${
				podNamePrefix === undefined
					? exactMatch(instances ?? [])
					: JSON.stringify(
							`^${escapeRegex(podNamePrefix)}${exactPostgresBranch ? '[a-f0-9]{8}-[0-9]+' : '.*'}$`
						)
			}`
		);
	}
	let query = `{${selectors.join(',')}} | ${labelFilters.join(' | ')}`;

	if (search?.trim()) {
		query += ` |~${JSON.stringify(`(?i)${escapeRegex(search.trim())}`)}`;
	}

	const parseJSON = !!logLevels?.length || additionalFilters.length > 0;
	if (parseJSON) query += ' | json';

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
		query += ` | level=~${JSON.stringify(`(?i)^(?:${levels.join('|')})$`)}`;
	}

	for (const filter of additionalFilters) {
		validateLabelFilter(filter);
		query += ` | ${filter.name}${filter.operator}${JSON.stringify(filter.value)}`;
	}
	if (parseJSON) query += ' | drop __error__, __error_details__';

	return query;
}
