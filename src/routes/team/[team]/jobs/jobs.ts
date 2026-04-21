import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `Jobs` and `JobsListMetadata` queries.
 *
 * Mirrors the previous Houdini-based queries in `query.gql` and
 * `metadata.gql`. Loaded by `+page.ts` to power the team jobs list page
 * (`/team/[team]/jobs`).
 *
 * The `@paginate(mode: SinglePage)` and `@cache(...)` directives from the
 * Houdini documents are dropped — pagination is URL-driven via
 * `cursorPaginationLoaders` (see `$lib/urql/pagination`) and cache policy
 * is set per-query at call sites that need it.
 */
export const JobsQuery = gql(/* GraphQL */ `
	query Jobs(
		$team: Slug!
		$orderBy: JobOrder
		$filter: TeamJobsFilter
		$first: Int
		$last: Int
		$before: Cursor
		$after: Cursor
	) {
		team(slug: $team) {
			environments {
				id
				environment {
					name
				}
			}

			jobs(
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
					schedule {
						expression
						timeZone
					}
					teamEnvironment {
						environment {
							name
						}
					}
					team {
						slug
					}
					runs(first: 1) {
						pageInfo {
							totalCount
						}
						edges {
							node {
								startTime
								status {
									state
									message
								}
							}
						}
					}
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
					state
					deployments(first: 1) {
						nodes {
							createdAt
						}
					}
				}
			}
		}
	}
`);

export const JobsListMetadataQuery = gql(/* GraphQL */ `
	query JobsListMetadata($team: Slug!) {
		team(slug: $team) {
			environments {
				id
				environment {
					name
				}
			}
			totalJobs: jobs {
				pageInfo {
					totalCount
				}
			}
		}
	}
`);
