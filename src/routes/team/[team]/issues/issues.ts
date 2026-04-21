import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `TeamIssues` and `TeamIssuesMetadata` queries for the team
 * issues list page.
 *
 * Mirrors the previous Houdini-based queries in `query.gql` and
 * `metadata.gql`. Loaded by `+page.ts` to power the team issues list
 * page (`/team/[team]/issues`).
 *
 * The `@cache(policy: NetworkOnly)` and `@paginate(mode: SinglePage)`
 * directives from the Houdini documents are dropped — pagination is
 * URL-driven via `cursorPaginationLoaders` (see `$lib/urql/pagination`).
 */
export const TeamIssuesQuery = gql(/* GraphQL */ `
	query TeamIssues(
		$team: Slug!
		$filter: IssueFilter
		$orderBy: IssueOrder
		$first: Int
		$last: Int
		$before: Cursor
		$after: Cursor
	) {
		team(slug: $team) {
			slug
			environments {
				id
				environment {
					name
				}
			}
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
			total: issues {
				pageInfo {
					totalCount
				}
			}
		}
	}
`);

export const TeamIssuesMetadataQuery = gql(/* GraphQL */ `
	query TeamIssuesMetadata($team: Slug!) {
		team(slug: $team) {
			environments {
				id
				environment {
					name
				}
			}
			todos: issues(filter: { severity: TODO }) {
				pageInfo {
					totalCount
				}
			}
			warnings: issues(filter: { severity: WARNING }) {
				pageInfo {
					totalCount
				}
			}
			critical: issues(filter: { severity: CRITICAL }) {
				pageInfo {
					totalCount
				}
			}
			total: issues {
				pageInfo {
					totalCount
				}
			}
		}
	}
`);
