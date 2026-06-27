import {
	IssueOrderField,
	load_TeamIssues,
	load_TeamIssuesMetadata,
	OrderDirection
} from '$houdini';
import type { IssueFilter } from '$houdini/graphql/inputs';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const severity: string | undefined = event.url.searchParams.get('severity') || undefined;
	const issueType: string | undefined = event.url.searchParams.get('issueType') || undefined;
	const environments: string[] | undefined =
		event.url.searchParams.get('environments')?.split(',').filter(Boolean) || undefined;

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, { title: 'Issues', pageHeaderTitle: '' })),
		...(await load_TeamIssues({
			event,
			blocking: true,
			variables: {
				team: event.params.team,
				filter: { severity, issueType, environments } as IssueFilter,
				orderBy: {
					field: urlToOrderField(IssueOrderField, IssueOrderField.SEVERITY, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.DESC)
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
