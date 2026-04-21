import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `TenantCost` and `CostMonthly` queries for the global tenant cost
 * page.
 *
 * Mirrors the previous Houdini-based queries in `query.gql` and
 * `costMonthly.gql`. The `@paginate(mode: SinglePage)` directive is
 * dropped — pagination is URL-driven via `cursorPaginationLoaders`
 * (see `$lib/urql/pagination`).
 */
export const TenantCostQuery = gql(/* GraphQL */ `
	query TenantCost($first: Int, $last: Int, $before: Cursor, $after: Cursor, $orderBy: TeamOrder) {
		teams(first: $first, last: $last, before: $before, after: $after, orderBy: $orderBy) {
			pageInfo {
				endCursor
				hasNextPage
				hasPreviousPage
				pageEnd
				pageStart
				startCursor
				totalCount
			}
			nodes {
				slug
				cost {
					monthlySummary {
						sum
					}
				}
			}
		}
	}
`);

export const CostMonthlyQuery = gql(/* GraphQL */ `
	query CostMonthly($from: Date!, $to: Date!) {
		costMonthlySummary(from: $from, to: $to) {
			series {
				date
				sum

				services {
					cost
					service
				}
			}
		}
	}
`);
