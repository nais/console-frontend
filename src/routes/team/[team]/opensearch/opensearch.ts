import { graphql as gql } from '$lib/urql/gql';

/**
 * `OpenSearch` query for the team OpenSearch list page. Migrated from
 * the previous Houdini-based document in `query.gql`. The
 * `@cache(policy: CacheAndNetwork)` and `@paginate(mode: SinglePage)`
 * directives are dropped — pagination is URL-driven via
 * `cursorPaginationLoaders` (see `$lib/urql/pagination`).
 */
export const OpenSearchQuery = gql(/* GraphQL */ `
	query OpenSearch(
		$team: Slug!
		$orderBy: OpenSearchOrder
		$from: Date!
		$to: Date!
		$first: Int
		$last: Int
		$before: Cursor
		$after: Cursor
	) {
		team(slug: $team) {
			slug

			cost {
				daily(from: $from, to: $to, filter: { services: ["OpenSearch"] }) {
					series {
						services {
							service
						}
						date
						sum
					}
				}
			}

			openSearches(first: $first, last: $last, orderBy: $orderBy, before: $before, after: $after) {
				pageInfo {
					hasNextPage
					hasPreviousPage
					totalCount
					pageStart
					pageEnd
					startCursor
					endCursor
				}
				nodes {
					id
					__typename
					name
					teamEnvironment {
						environment {
							name
						}
					}
					team {
						slug
					}
					state
					issues {
						pageInfo {
							totalCount
						}
						edges {
							node {
								severity
							}
						}
					}
				}
			}
		}
	}
`);
