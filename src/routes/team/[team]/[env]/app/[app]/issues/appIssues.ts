import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `ApplicationIssues` query for the application issues list page.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power `/team/[team]/[env]/app/[app]/issues`. The
 * `@cache(policy: NetworkOnly)` and `@paginate(mode: SinglePage)`
 * directives from the Houdini document are dropped — pagination is
 * URL-driven via `cursorPaginationLoaders`.
 */
export const ApplicationIssuesQuery = gql(/* GraphQL */ `
	query ApplicationIssues(
		$team: Slug!
		$env: String!
		$app: String!
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
				application(name: $app) {
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
