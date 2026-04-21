import { graphql as gql } from '$lib/urql/gql';

/**
 * `Valkeys` query for the team Valkey list page. Migrated from the
 * previous Houdini-based document in `query.gql`. The
 * `@cache(policy: CacheAndNetwork)` and `@paginate(mode: SinglePage)`
 * directives are dropped — pagination is URL-driven via
 * `cursorPaginationLoaders` (see `$lib/urql/pagination`).
 */
export const ValkeysQuery = gql(/* GraphQL */ `
	query Valkeys(
		$team: Slug!
		$orderBy: ValkeyOrder
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
				daily(from: $from, to: $to, filter: { services: ["Valkey"] }) {
					series {
						services {
							service
						}
						date
						sum
					}
				}
			}

			valkeys(first: $first, last: $last, orderBy: $orderBy, before: $before, after: $after) {
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
					team {
						slug
					}
					teamEnvironment {
						environment {
							name
						}
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
