import {
	IssueOrderField,
	load_TeamIssues,
	load_TeamIssuesMetadata,
	OrderDirection,
	type IssueFilter
} from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const severity: string | undefined = event.url.searchParams.get('severity') || undefined;
	const environments: string[] | undefined =
		event.url.searchParams.get('environments')?.split(',') || undefined;

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, { title: 'Issues' })),
		...(await load_TeamIssues({
			event,
			variables: {
				team: event.params.team,
				filter: { severity, environments } as IssueFilter,
				orderBy: {
					field: urlToOrderField(IssueOrderField, IssueOrderField.SEVERITY, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.ASC)
				},
				...(before ? { before, last: rows } : { after, first: rows })
			}
		})),
		...(await load_TeamIssuesMetadata({
			event,
			variables: {
				team: event.params.team
			}
		}))
	};
}
