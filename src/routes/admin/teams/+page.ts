import type { OrderDirection$options, TeamFilter, TeamOrderField$options } from '$houdini';
import { load_Teams, TeamOrderField } from '$houdini';
import type { PageLoad } from './$houdini';

const rows = 25;

export const load: PageLoad = async (event) => {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	let filter = event.url.searchParams.get('filter') || '';

	if (filter !== 'WITHOUT_WORKLOADS' && filter !== 'WITH_WORKLOADS' && filter !== 'ALL') {
		filter = 'ALL';
	}

	const field = (event.url.searchParams.get('field') ||
		TeamOrderField.SLUG) as TeamOrderField$options;
	const direction = (event.url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	const hasWorkloads =
		filter === 'WITHOUT_WORKLOADS' ? false : filter === 'WITH_WORKLOADS' ? true : undefined;

	return {
		filter,
		...(await load_Teams({
			event,
			variables: {
				...(before ? { before, last: rows } : { after, first: rows }),
				filter: { hasWorkloads } as TeamFilter,
				orderBy: { field: field, direction: direction }
			}
		}))
	};
};
