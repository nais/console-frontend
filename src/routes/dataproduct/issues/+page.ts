import { IssueType, load_AllIssues } from '$houdini';

export async function load(event) {
	const issueTypeParam = event.url.searchParams.get('issueType');
	const issueType =
		issueTypeParam &&
		Object.values(IssueType).includes(issueTypeParam as (typeof IssueType)[keyof typeof IssueType])
			? (issueTypeParam as (typeof IssueType)[keyof typeof IssueType])
			: undefined;

	return {
		...(await load_AllIssues({
			event,
			variables: {
				issueType
			}
		}))
	};
}
