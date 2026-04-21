import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `CVES` query for the CVE database list page.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. The
 * `@paginate(mode: SinglePage)` directive is dropped — pagination is
 * URL-driven via `cursorPaginationLoaders` (see `$lib/urql/pagination`).
 */
export const CVESQuery = gql(/* GraphQL */ `
	query CVES($first: Int, $last: Int, $before: Cursor, $after: Cursor, $orderBy: CVEOrder) {
		cves(first: $first, last: $last, before: $before, after: $after, orderBy: $orderBy) {
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
				id
				identifier
				severity
				title
				description
				detailsLink
				cvssScore
				workloads {
					pageInfo {
						totalCount
					}
				}
			}
		}
	}
`);
