import { graphql as gql } from '$lib/urql/gql';

/**
 * `Deployments` query for the team deployments list page. Migrated
 * from the previous Houdini-based document in `query.gql`. The
 * `@paginate(mode: SinglePage)` directive is dropped — pagination is
 * URL-driven via `cursorPaginationLoaders` (see `$lib/urql/pagination`).
 */
export const DeploymentsQuery = gql(/* GraphQL */ `
	query Deployments($team: Slug!, $first: Int, $last: Int, $before: Cursor, $after: Cursor) {
		team(slug: $team) {
			deployments(first: $first, last: $last, before: $before, after: $after) {
				pageInfo {
					hasNextPage
					endCursor
					hasPreviousPage
					pageEnd
					pageStart
					startCursor
					totalCount
				}
				nodes {
					id
					statuses {
						nodes {
							state
							message
							createdAt
						}
					}
					resources {
						nodes {
							id
							kind
							name
						}
					}
					environmentName
					createdAt
					teamSlug
					repository
					commitSha
					deployerUsername
					triggerUrl
				}
			}
		}
	}
`);
