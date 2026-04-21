import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `Valkey` query for the Valkey single-instance detail page.
 *
 * Mirrors the previous Houdini `query.gql`. Loaded by `+page.ts` to power
 * `/team/[team]/[env]/valkey/[valkey]`. Houdini-only directives
 * (`@cache`, `@paginate`, `@with`, `@mask_disable`) have been dropped —
 * pagination is URL-driven via `cursorPaginationLoaders` and
 * `SidebarActivityLogFragment` has no equivalent of `@with(limit: 20)`,
 * so the default selection is used.
 */
export const ValkeyQuery = gql(/* GraphQL */ `
	query Valkey(
		$environment: String!
		$team: Slug!
		$name: String!
		$orderBy: ValkeyAccessOrder!
		$first: Int
		$after: Cursor
		$last: Int
		$before: Cursor
	) {
		team(slug: $team) {
			slug
			environment(name: $environment) {
				environment {
					name
				}
				valkey(name: $name) {
					__typename
					id
					name
					tier
					memory
					maxMemoryPolicy
					notifyKeyspaceEvents
					databases
					state
					teamEnvironment {
						environment {
							name
						}
					}
					issues {
						edges {
							node {
								id
								...IssueFragment
							}
						}
					}
					maintenance {
						window {
							dayOfWeek
							timeOfDay
						}
						updates {
							pageInfo {
								hasNextPage
								hasPreviousPage
								pageStart
								pageEnd
								totalCount
								startCursor
								endCursor
							}
							nodes {
								deadline
								description
								startAt
								title
							}
						}
					}

					access(first: $first, after: $after, last: $last, before: $before, orderBy: $orderBy) {
						pageInfo {
							hasNextPage
							hasPreviousPage
							pageStart
							pageEnd
							totalCount
							startCursor
							endCursor
						}

						edges {
							node {
								access
								workload {
									id
									name
									teamEnvironment {
										environment {
											name
										}
									}
									__typename
									team {
										slug
									}
								}
							}
						}
					}

					...ValkeyManifestFragment
					...SidebarActivityLogFragment
				}
			}
		}
	}
`);

/**
 * `RunValkeyMaintenance` mutation, invoked from the maintenance panel
 * when a team member triggers a manual maintenance run.
 */
export const RunValkeyMaintenanceMutation = gql(/* GraphQL */ `
	mutation runValkeyMaintenance(
		$serviceName: String!
		$teamSlug: Slug!
		$environmentName: String!
	) {
		startValkeyMaintenance(
			input: { serviceName: $serviceName, teamSlug: $teamSlug, environmentName: $environmentName }
		) {
			error
		}
	}
`);
