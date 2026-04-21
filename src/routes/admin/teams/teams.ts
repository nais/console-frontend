import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `Teams` query for the admin teams list page.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. The
 * `@paginate(mode: SinglePage)` directive is dropped — pagination is
 * URL-driven via `cursorPaginationLoaders` (see `$lib/urql/pagination`).
 */
export const TeamsQuery = gql(/* GraphQL */ `
	query Teams(
		$first: Int
		$last: Int
		$before: Cursor
		$after: Cursor
		$filter: TeamFilter
		$orderBy: TeamOrder
	) {
		teams(
			first: $first
			last: $last
			before: $before
			after: $after
			filter: $filter
			orderBy: $orderBy
		) {
			pageInfo {
				hasNextPage
				hasPreviousPage
				pageStart
				pageEnd
				totalCount
				startCursor
				endCursor
			}
			edges {
				node {
					slug
					members {
						pageInfo {
							totalCount
						}
					}

					inventoryCounts {
						applications {
							total
						}
						bigQueryDatasets {
							total
						}
						buckets {
							total
						}
						jobs {
							total
						}
						kafkaTopics {
							total
						}
						openSearches {
							total
						}
						postgresInstances {
							total
						}
						sqlInstances {
							total
						}
						valkeys {
							total
						}
					}
				}
			}
		}
	}
`);
