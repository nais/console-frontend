import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `ReconcilerLogs` query for the admin reconciler logs page.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. The
 * `@paginate(mode: SinglePage)` directive is dropped — pagination is
 * URL-driven via `cursorPaginationLoaders` (see `$lib/urql/pagination`).
 */
export const ReconcilerLogsQuery = gql(/* GraphQL */ `
	query ReconcilerLogs($id: ID!, $first: Int, $last: Int, $before: Cursor, $after: Cursor) {
		node(id: $id) {
			__typename
			... on Reconciler {
				enabled
				displayName
				name
				description
				errors(first: $first, last: $last, before: $before, after: $after) {
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
						id
						correlationID
						createdAt
						message
						team {
							slug
						}
					}
				}
			}
		}
	}
`);
