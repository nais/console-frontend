import { graphql as gql } from '$lib/urql/gql';

/**
 * `Secrets` query for the team secrets list page.
 *
 * Migrated from the previous Houdini `query.gql`. Houdini-only
 * directives (`@cache(policy: CacheAndNetwork)`, `@paginate(mode:
 * SinglePage)`, `@with(...) @mask_disable` on the
 * `...SidebarActivityLogFragment` spread) have been dropped — pagination
 * is URL-driven via `cursorPaginationLoaders` and the sidebar fragment
 * is spread without arguments (urql has no fragment-arguments
 * equivalent).
 */
export const SecretsQuery = gql(/* GraphQL */ `
	query Secrets(
		$team: Slug!
		$orderBy: SecretOrder
		$filter: SecretFilter
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
			secrets(
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
 * `createSecret` mutation, invoked from the `CreateSecret.svelte` modal
 * on the team secrets page.
 */
export const CreateSecretMutation = gql(/* GraphQL */ `
	mutation createSecret($name: String!, $team: Slug!, $env: String!) {
		createSecret(input: { name: $name, team: $team, environment: $env }) {
			secret {
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
