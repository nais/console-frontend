import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `CVEDetails` query for the CVE detail page header card.
 *
 * Mirrors the previous Houdini-based query in `details.gql`. The
 * `@cache(policy: CacheAndNetwork)` directive is dropped — urql's
 * default request policy already revalidates on navigation.
 */
export const CVEDetailsQuery = gql(/* GraphQL */ `
	query CVEDetails($identifier: String!) {
		cve(identifier: $identifier) {
			id
			identifier
			title
			description
			severity
			cvssScore
			detailsLink
		}
	}
`);

/**
 * Typed `CVEWorkloads` query for the affected-workloads list on the CVE
 * detail page.
 *
 * Mirrors the previous Houdini-based query in `workloads.gql`. The
 * `@cache(policy: CacheAndNetwork)` directive is dropped — pagination is
 * URL-driven via `cursorPaginationLoaders` (see `$lib/urql/pagination`).
 */
export const CVEWorkloadsQuery = gql(/* GraphQL */ `
	query CVEWorkloads(
		$identifier: String!
		$first: Int
		$last: Int
		$after: Cursor
		$before: Cursor
	) {
		cve(identifier: $identifier) {
			id
			workloads(first: $first, last: $last, after: $after, before: $before) {
				pageInfo {
					hasNextPage
					hasPreviousPage
					startCursor
					endCursor
					totalCount
					pageStart
					pageEnd
				}
				nodes {
					workload {
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
						image {
							name
							tag
						}
					}
					vulnerability {
						identifier
						severity
						package
						suppression {
							state
						}
					}
				}
			}
		}
	}
`);
