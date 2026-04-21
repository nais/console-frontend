import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `JobIssues` query for the job issues list page.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power `/team/[team]/[env]/job/[job]/issues`. The
 * `@cache(policy: NetworkOnly)` and `@paginate(mode: SinglePage)`
 * directives from the Houdini document are dropped — pagination is
 * URL-driven via `cursorPaginationLoaders`.
 */
export const JobIssuesQuery = gql(/* GraphQL */ `
	query JobIssues(
		$team: Slug!
		$env: String!
		$job: String!
		$filter: ResourceIssueFilter
		$orderBy: IssueOrder
		$first: Int
		$last: Int
		$before: Cursor
		$after: Cursor
	) {
		team(slug: $team) {
			slug
			environment(name: $env) {
				id
				job(name: $job) {
					id
					name
					issues(
						first: $first
						last: $last
						filter: $filter
						orderBy: $orderBy
						before: $before
						after: $after
					) {
						pageInfo {
							startCursor
							endCursor
							hasNextPage
							hasPreviousPage
							pageStart
							pageEnd
							totalCount
						}
						nodes {
							id
							__typename

							teamEnvironment {
								environment {
									name
								}
							}
							...IssueFragment
						}
					}
				}
			}
		}
	}
`);
