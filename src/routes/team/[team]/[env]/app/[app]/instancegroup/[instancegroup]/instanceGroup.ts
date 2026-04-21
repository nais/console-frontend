import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `InstanceGroupDetail` query.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power the instance group detail page
 * (`/team/[team]/[env]/app/[app]/instancegroup/[instancegroup]`).
 *
 * The Houdini `@cache(policy: NetworkOnly)` directive is dropped — cache
 * policy is set per-call site as needed.
 */
export const InstanceGroupDetailQuery = gql(/* GraphQL */ `
	query InstanceGroupDetail($app: String!, $team: Slug!, $env: String!) {
		team(slug: $team) {
			viewerIsMember
			environment(name: $env) {
				application(name: $app) {
					name
					team {
						slug
					}
					teamEnvironment {
						environment {
							name
						}
					}
					resources {
						scaling {
							maxInstances
							minInstances
							strategies {
								__typename
								... on KafkaLagScalingStrategy {
									consumerGroup
									threshold
									topicName
								}
								... on CPUScalingStrategy {
									threshold
								}
							}
						}
						requests {
							cpu
							memory
						}
						limits {
							cpu
							memory
						}
					}
					utilization {
						requested_cpu: requested(resourceType: CPU)
						requested_memory: requested(resourceType: MEMORY)
						limit_cpu: limit(resourceType: CPU)
						limit_memory: limit(resourceType: MEMORY)
						current_cpu: current(resourceType: CPU)
						current_memory: current(resourceType: MEMORY)
						recommendations {
							cpuRequestCores
							memoryLimitBytes
							memoryRequestBytes
						}
					}
					instanceGroups {
						id
						name
						image {
							name
							tag
						}
						created
						readyInstances
						desiredInstances
						environmentVariables {
							name
							value
							source {
								kind
								name
							}
						}
						mountedFiles {
							path
							source {
								kind
								name
							}
							content
							encoding
							error
						}
						instances {
							id
							name
							restarts
							status {
								state
								message
								ready
								lastExitReason
								lastExitCode
								lastExitTimestamp
							}
							created
							memory: instanceUtilization(resourceType: MEMORY) {
								current
							}
							cpu: instanceUtilization(resourceType: CPU) {
								current
							}
						}
					}
				}
			}
		}
	}
`);
