import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `Applications` and `ApplicationsListMetadata` queries.
 *
 * Mirrors the previous Houdini-based queries in `query.gql` and
 * `metadata.gql`. Loaded by `+page.ts` to power the team applications
 * list page (`/team/[team]/applications`).
 *
 * The `@paginate(mode: SinglePage)` and `@cache(policy: CacheAndNetwork)`
 * directives from the Houdini documents are dropped — pagination is
 * URL-driven via `cursorPaginationLoaders` (see `$lib/urql/pagination`)
 * and cache policy is set per-query at call sites that need it.
 */
export const ApplicationsQuery = gql(/* GraphQL */ `
	query Applications(
		$team: Slug!
		$orderBy: ApplicationOrder
		$filter: TeamApplicationsFilter
		$first: Int
		$last: Int
		$before: Cursor
		$after: Cursor
	) {
		team(slug: $team) {
			applications(
				first: $first
				last: $last
				orderBy: $orderBy
				filter: $filter
				before: $before
				after: $after
			) {
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
					__typename
					id
					name
					teamEnvironment {
						environment {
							name
						}
					}
					team {
						slug
					}
					state
					issues {
						pageInfo {
							totalCount
						}
						edges {
							node {
								severity
							}
						}
					}
					deployments(first: 1) {
						nodes {
							createdAt
						}
					}
					instances {
						pageInfo {
							totalCount
						}
						edges {
							node {
								status {
									message
									state
								}
							}
						}
					}
				}
			}
		}
	}
`);

export const ApplicationsListMetadataQuery = gql(/* GraphQL */ `
	query ApplicationsListMetadata($team: Slug!) {
		team(slug: $team) {
			environments {
				id
				environment {
					name
				}
			}
			totalApplications: applications {
				pageInfo {
					totalCount
				}
			}
		}
	}
`);
