import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `OpenSearchInstance` query for the OpenSearch single-instance
 * detail page.
 *
 * Mirrors the previous Houdini `query.gql`. Loaded by `+page.ts` to
 * power `/team/[team]/[env]/opensearch/[opensearch]`. Houdini-only
 * directives (`@paginate`, `@with`, `@mask_disable`) have been
 * dropped — pagination is URL-driven via `cursorPaginationLoaders`.
 */
export const OpenSearchInstanceQuery = gql(/* GraphQL */ `
	query OpenSearchInstance(
		$environment: String!
		$team: Slug!
		$name: String!
		$orderBy: OpenSearchAccessOrder!
		$first: Int
		$after: Cursor
		$last: Int
		$before: Cursor
	) {
		team(slug: $team) {
			slug
			environment(name: $environment) {
				openSearch(name: $name) {
					__typename
					id
					name
					version {
						actual
						desiredMajor
					}
					tier
					memory
					storageGB
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

					workload {
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
					...OpenSearchManifestFragment
					...SidebarActivityLogFragment
				}
			}
		}
	}
`);

/**
 * `RunOpenSearchMaintenance` mutation, invoked from the maintenance
 * panel when a team member triggers a manual maintenance run.
 */
export const RunOpenSearchMaintenanceMutation = gql(/* GraphQL */ `
	mutation runOpenSearchMaintenance(
		$serviceName: String!
		$teamSlug: Slug!
		$environmentName: String!
	) {
		startOpenSearchMaintenance(
			input: { serviceName: $serviceName, teamSlug: $teamSlug, environmentName: $environmentName }
		) {
			error
		}
	}
`);
