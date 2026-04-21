import { IssueType } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { AllIssuesQuery } from './issues';

export async function load(event) {
	const issueTypeParam = event.url.searchParams.get('issueType');
	const issueType =
		issueTypeParam && Object.values(IssueType).includes(issueTypeParam as IssueType)
			? (issueTypeParam as IssueType)
			: undefined;

	return {
		AllIssues: await runQuery(event, AllIssuesQuery, {
			issueType
		})
	};
}
