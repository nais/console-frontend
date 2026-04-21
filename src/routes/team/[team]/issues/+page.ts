import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import {
	IssueOrderField,
	IssueType,
	OrderDirection,
	Severity,
	type IssueFilter
} from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { TeamIssuesMetadataQuery, TeamIssuesQuery } from './issues';

const rows = 25;

function parseSeverity(raw: string | null): Severity | undefined {
	if (!raw) return undefined;
	const values = new Set<string>(Object.values(Severity));
	return values.has(raw) ? (raw as Severity) : undefined;
}

function parseIssueType(raw: string | null): IssueType | undefined {
	if (!raw) return undefined;
	const values = new Set<string>(Object.values(IssueType));
	return values.has(raw) ? (raw as IssueType) : undefined;
}

export async function load(event) {
	const severity = parseSeverity(event.url.searchParams.get('severity'));
	const issueType = parseIssueType(event.url.searchParams.get('issueType'));
	const environments: string[] | undefined =
		event.url.searchParams.get('environments')?.split(',') || undefined;

	const filter: IssueFilter = { severity, issueType, environments };

	return {
		...(await addPageMeta(event, { title: 'Issues' })),
		TeamIssues: await runQuery(event, TeamIssuesQuery, {
			team: event.params.team,
			filter,
			orderBy: {
				field: urlToOrderField(IssueOrderField, IssueOrderField.SEVERITY, event.url),
				direction: urlToOrderDirection(event.url, OrderDirection.DESC)
			},
			...readCursorPagination(event.url, rows)
		}),
		TeamIssuesMetadata: await runQuery(event, TeamIssuesMetadataQuery, {
			team: event.params.team
		})
	};
}
