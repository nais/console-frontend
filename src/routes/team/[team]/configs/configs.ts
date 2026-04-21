import { graphql as gql } from '$lib/urql/gql';

/**
 * `Configs` query for the team configs list page.
 *
 * Migrated from the previous Houdini `query.gql`. Houdini-only
 * directives (`@cache(policy: CacheAndNetwork)`, `@paginate(mode:
 * SinglePage)`, `@with(...) @mask_disable` on the
 * `...SidebarActivityLogFragment` spread) have been dropped — pagination
 * is URL-driven via `cursorPaginationLoaders` and the sidebar fragment
 * is spread without arguments (urql has no fragment-arguments
 * equivalent).
 */
export const ConfigsQuery = gql(/* GraphQL */ `
	query Configs(
		$team: Slug!
		$orderBy: ConfigOrder
		$filter: ConfigFilter
		$first: Int
		$last: Int
		$before: Cursor
		$after: Cursor
	) {
		me {
			... on User {
				isAdmin
			}
		}
		team(slug: $team) {
			viewerIsMember
			configs(
				first: $first
				last: $last
				before: $before
				after: $after
				orderBy: $orderBy
				filter: $filter
			) {
				pageInfo {
					totalCount
					hasPreviousPage
					hasNextPage
					pageEnd
					pageStart
					startCursor
					endCursor
				}
				nodes {
					id
					name
					lastModifiedAt
					teamEnvironment {
						environment {
							name
						}
					}
					workloads {
						pageInfo {
							totalCount
						}
					}
				}
			}
			environments {
				environment {
					name
				}
			}
			...SidebarActivityLogFragment
		}
	}
`);

/**
 * `createConfig` mutation, invoked from the `CreateConfig.svelte` modal
 * on the team configs page.
 */
export const CreateConfigMutation = gql(/* GraphQL */ `
	mutation createConfig($name: String!, $team: Slug!, $env: String!) {
		createConfig(input: { name: $name, teamSlug: $team, environmentName: $env }) {
			config {
				id
				name
				teamEnvironment {
					environment {
						name
					}
				}
			}
		}
	}
`);
