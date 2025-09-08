import { IssueOrderField, load_TeamIssues, OrderDirection } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';

const rows = 10;

export async function load(event) {
	// const filter: string = event.url.searchParams.get('filter') || '';
	// const environments: string[] | undefined =
	// 	event.url.searchParams.get('environments') === 'none'
	// 		? undefined
	// 		: event.url.searchParams.get('environments')?.split(',') || [];

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await load_TeamIssues({
			event,
			variables: {
				team: event.params.team,
				// filter: { filter } as IssueFilter,
				orderBy: {
					field: urlToOrderField(IssueOrderField, IssueOrderField.SEVERITY, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.ASC)
				},
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
