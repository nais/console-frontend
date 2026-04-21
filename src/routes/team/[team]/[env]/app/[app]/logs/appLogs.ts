import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `Instances` query for the application logs page.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power `/team/[team]/[env]/app/[app]/logs` and provides
 * the list of instances the user can subscribe to logs for.
 */
export const InstancesQuery = gql(/* GraphQL */ `
	query Instances($app: String!, $team: Slug!, $env: String!) {
		team(slug: $team) {
			slug
			environment(name: $env) {
				environment {
					name
				}
				application(name: $app) {
					name
					instances {
						nodes {
							name
						}
					}
					logDestinations {
						id
						__typename
						... on LogDestinationLoki {
							grafanaURL
						}
					}
				}
			}
		}
	}
`);

/**
 * Subscription for streaming application workload log lines. Replaces
 * the inline Houdini `graphql` template tag previously used in
 * `Logs.svelte`.
 */
export const AppLogsSubscription = gql(/* GraphQL */ `
	subscription AppWorkloadLogSubscription($filter: WorkloadLogSubscriptionFilter!) {
		workloadLog(filter: $filter) {
			time
			message
			instance
		}
	}
`);
