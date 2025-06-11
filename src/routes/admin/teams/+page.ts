import type { OrderDirection$options, TeamFilter, TeamOrderField$options } from '$houdini';
import { TeamOrderField } from '$houdini';
import type { TeamsVariables } from './$houdini';

const rows = 25;

export const _TeamsVariables: TeamsVariables = ({ url }) => {
	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';
	const filter = url.searchParams.get('filter') || '';
	const field = (url.searchParams.get('field') || TeamOrderField.SLUG) as TeamOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	const hasWorkloads =
		filter === 'no_workloads' ? false : filter === 'has_workloads' ? true : undefined;

	return {
		...(before ? { before, last: rows } : { after, first: rows }),
		filter: { hasWorkloads } as TeamFilter,
		orderBy: { field: field, direction: direction }
	};
};
