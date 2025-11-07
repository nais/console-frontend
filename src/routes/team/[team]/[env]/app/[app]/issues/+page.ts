import {
	IssueOrderField,
	load_ApplicationIssues,
	OrderDirection,
	type IssueFilter
} from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta.js';

const rows = 25;

export async function load(event) {
	const severity: string | undefined = event.url.searchParams.get('severity') || undefined;

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, {
			title: 'Issues'
		})),
		...(await load_ApplicationIssues({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				app: event.params.app,
				filter: { severity } as IssueFilter,
				orderBy: {
					field: urlToOrderField(IssueOrderField, IssueOrderField.SEVERITY, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.ASC)
				},
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
