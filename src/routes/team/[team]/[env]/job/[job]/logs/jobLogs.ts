import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `RunsWithPodNames` query for the job logs page.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power `/team/[team]/[env]/job/[job]/logs` and provides
 * the list of runs / instances the user can subscribe to logs for.
 */
export const RunsWithPodNamesQuery = gql(/* GraphQL */ `
	query RunsWithPodNames($job: String!, $team: Slug!, $env: String!) {
		team(slug: $team) {
			slug
			environment(name: $env) {
				environment {
					name
				}
				job(name: $job) {
					name
					logDestinations {
						id
						__typename
						... on LogDestinationLoki {
							grafanaURL
						}
					}
					runs {
						nodes {
							id
							name
							instances {
								nodes {
									id
									name
								}
							}
							status {
								state
							}
						}
					}
				}
			}
		}
	}
`);

/**
 * Subscription for streaming job workload log lines. Replaces the
 * inline Houdini `graphql` template tag previously used in
 * `JobLogs.svelte`.
 */
export const JobLogsSubscription = gql(/* GraphQL */ `
	subscription JobWorkloadLogSubscription($filter: WorkloadLogSubscriptionFilter!) {
		workloadLog(filter: $filter) {
			time
			message
			instance
		}
	}
`);
