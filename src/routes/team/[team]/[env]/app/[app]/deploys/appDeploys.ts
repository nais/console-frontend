import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `AppDeploys` query.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power the application deployments page
 * (`/team/[team]/[env]/app/[app]/deploys`). The
 * `@paginate(mode: SinglePage)` directive from the Houdini document is
 * dropped — pagination is URL-driven via `cursorPaginationLoaders`.
 */
export const AppDeploysQuery = gql(/* GraphQL */ `
	query AppDeploys(
		$app: String!
		$team: Slug!
		$env: String!
		$first: Int
		$last: Int
		$before: Cursor
		$after: Cursor
	) {
		team(slug: $team) {
			environment(name: $env) {
				application(name: $app) {
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
					deployments(first: $first, last: $last, before: $before, after: $after) {
						pageInfo {
							totalCount
							hasNextPage
							hasPreviousPage
							pageEnd
							pageStart
							startCursor
							endCursor
						}
						nodes {
							id
							resources {
								nodes {
									id
									kind
									name
								}
							}
							statuses {
								nodes {
									state
									message
									createdAt
								}
							}
							environmentName
							teamSlug
							triggerUrl
							createdAt
							repository
							commitSha
							deployerUsername
						}
					}
				}
			}
		}
	}
`);
