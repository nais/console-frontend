import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `AdminUsers` query for the admin users list page.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. The
 * `@paginate(mode: SinglePage)` directive is dropped — pagination is
 * URL-driven via `cursorPaginationLoaders` (see `$lib/urql/pagination`).
 */
export const AdminUsersQuery = gql(/* GraphQL */ `
	query AdminUsers($first: Int, $last: Int, $before: Cursor, $after: Cursor) {
		users(first: $first, last: $last, before: $before, after: $after) {
			nodes {
				id
				name
				email
				externalID
				isAdmin
			}
			pageInfo {
				hasNextPage
				hasPreviousPage
				pageStart
				pageEnd
				totalCount
				startCursor
				endCursor
			}
		}
	}
`);
