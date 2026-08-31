import type { OrderDirection$options, TeamOrderField$options } from '$houdini';
import { load_Teams, OrderDirection, TeamOrderField } from '$houdini';
import type { TeamFilter } from '$houdini/graphql/inputs';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	let filter = event.url.searchParams.get('filter') || '';

	if (filter !== 'WITHOUT_WORKLOADS' && filter !== 'WITH_WORKLOADS' && filter !== 'ALL') {
		filter = 'ALL';
	}

	const fieldParam = event.url.searchParams.get('field') || TeamOrderField.SLUG;
	const field: TeamOrderField$options = Object.values(TeamOrderField).includes(
		fieldParam as TeamOrderField$options
	)
		? (fieldParam as TeamOrderField$options)
		: TeamOrderField.SLUG;
	const dirParam = event.url.searchParams.get('direction') || 'ASC';
	const direction: OrderDirection$options = Object.values(OrderDirection).includes(
		dirParam as OrderDirection$options
	)
		? (dirParam as OrderDirection$options)
		: 'ASC';

	const hasWorkloads =
		filter === 'WITHOUT_WORKLOADS' ? false : filter === 'WITH_WORKLOADS' ? true : undefined;

	return {
		filter,
		...(await addPageMeta(event, { title: 'Teams' })),
		...(await load_Teams({
			event,
			variables: {
				...(before ? { before, last: rows } : { after, first: rows }),
				filter: { hasWorkloads } as TeamFilter,
				orderBy: { field: field, direction: direction }
			}
		}))
	};
}
