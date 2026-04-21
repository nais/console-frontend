import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `UserSyncLogs` query for the admin user sync log page.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. The
 * `@paginate(mode: SinglePage)` directive is dropped — pagination is
 * URL-driven via `cursorPaginationLoaders` (see `$lib/urql/pagination`).
 */
export const UserSyncLogsQuery = gql(/* GraphQL */ `
	query UserSyncLogs($first: Int, $last: Int, $before: Cursor, $after: Cursor) {
		userSyncLog(first: $first, last: $last, before: $before, after: $after) {
			nodes {
				id
				__typename
				createdAt
				message
				userName
				userEmail
				... on UserUpdatedUserSyncLogEntry {
					oldUserName
					oldUserEmail
				}
				... on RoleAssignedUserSyncLogEntry {
					roleName
				}
				... on RoleRevokedUserSyncLogEntry {
					roleName
				}
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
