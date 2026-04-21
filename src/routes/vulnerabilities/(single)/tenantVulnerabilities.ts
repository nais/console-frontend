import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `TenantVulnerabilites` query for the global vulnerabilities pages.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Used by both
 * the `(single)` layout (for the tenant-wide summary) and the
 * `(single)/teams` page (for the per-team list with pagination). The
 * `@paginate(mode: SinglePage)` directive is dropped — pagination is
 * URL-driven via `cursorPaginationLoaders` (see `$lib/urql/pagination`).
 */
export const TenantVulnerabilitesQuery = gql(/* GraphQL */ `
	query TenantVulnerabilites(
		$first: Int
		$last: Int
		$before: Cursor
		$after: Cursor
		$orderBy: TeamOrder
	) {
		teams(
			first: $first
			last: $last
			before: $before
			after: $after
			orderBy: $orderBy
			filter: { hasWorkloads: true }
		) {
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
				workloads {
					pageInfo {
						totalCount
					}
				}
				vulnerabilitySummary {
					critical
					high
					medium
					low
					unassigned
					riskScore
					coverage
				}
			}
		}
		vulnerabilitySummary {
			critical
			high
			medium
			low
			unassigned
			riskScore
			coverage
			sbomCount
		}
	}
`);
