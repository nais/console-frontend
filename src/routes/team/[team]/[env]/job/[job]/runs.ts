import { graphql as gql } from '$lib/urql/gql';

/**
 * Fragment used by `Runs.svelte` to render the list of job runs for a
 * job, along with the resource requests/limits used by the job.
 *
 * The fragment is colocated as a `.ts` module (rather than inline in
 * the `.svelte` file) so callers can import and spread it from their
 * own query documents without dragging the component into a
 * server-only `load` graph.
 *
 * NOTE: Houdini's `@list(name: "All_Runs")` directive on the `runs`
 * connection has no urql equivalent. List invalidation after run
 * deletion / triggering should be handled via `@urql/exchange-graphcache`
 * `updates` resolvers per mutation as those are migrated.
 */
export const JobRunsFragment = gql(/* GraphQL */ `
	fragment JobRunsFragment on Job {
		team {
			slug
		}
		teamEnvironment {
			environment {
				name
			}
		}
		name
		resources {
			requests {
				cpu
				memory
			}
			limits {
				cpu
				memory
			}
		}

		runs(first: 999) {
			edges {
				node {
					id
					name
					startTime
					completionTime
					duration
					instances {
						pageInfo {
							totalCount
						}
					}
					status {
						message
						state
					}
					trigger {
						type
						actor
					}
				}
			}
		}
	}
`);
