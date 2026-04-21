import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `ActivityLog` query for the team activity log page.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power the team activity log page
 * (`/team/[team]/activity-log`).
 *
 * The `@cache(policy: NetworkOnly)` and `@paginate(mode: SinglePage)`
 * directives from the Houdini document are dropped — pagination is
 * URL-driven via `cursorPaginationLoaders` (see `$lib/urql/pagination`).
 */
export const ActivityLogQuery = gql(/* GraphQL */ `
	query ActivityLog(
		$team: Slug!
		$first: Int
		$last: Int
		$before: Cursor
		$after: Cursor
		$filter: ActivityLogFilter
	) {
		team(slug: $team) {
			slug
			activityLog(first: $first, last: $last, before: $before, after: $after, filter: $filter) {
				pageInfo {
					hasNextPage
					hasPreviousPage
					pageEnd
					pageStart
					totalCount
					startCursor
					endCursor
				}
				nodes {
					id
					__typename
					...ActivityLogEntryFragment
				}
			}
		}
	}
`);
