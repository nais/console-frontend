import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import {
	IssueOrderField,
	IssueType,
	OrderDirection,
	Severity,
	type ResourceIssueFilter
} from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta.js';
import { ApplicationIssuesQuery } from './appIssues';

const rows = 25;

export async function load(event) {
	const severity = event.url.searchParams.get('severity') || undefined;
	const issueType = event.url.searchParams.get('issueType') || undefined;

	const filter: ResourceIssueFilter = {
		severity: severity ? (severity as Severity) : undefined,
		issueType: issueType ? (issueType as IssueType) : undefined
	};

	return {
		...(await addPageMeta(event, {
			title: 'Issues'
		})),
		ApplicationIssues: await runQuery(event, ApplicationIssuesQuery, {
			team: event.params.team,
			env: event.params.env,
			app: event.params.app,
			filter,
			orderBy: {
				field: urlToOrderField(IssueOrderField, IssueOrderField.SEVERITY, event.url),
				direction: urlToOrderDirection(event.url, OrderDirection.ASC)
			},
			...readCursorPagination(event.url, rows)
		})
	};
}
