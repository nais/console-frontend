import { graphql as gql } from '$lib/urql/gql';

/**
 * Fragment used by `IssueListItem.svelte` to render a single issue.
 * Each `... on XIssue` selection mirrors what the corresponding
 * issue component under `$lib/domain/issues/` reads off `data`.
 *
 * The fragment is colocated as a `.ts` module (rather than inline in
 * the `.svelte` file) so callers can import and spread it from their
 * own query documents without dragging the component into a
 * server-only `load` graph.
 */
export const IssueFragment = gql(/* GraphQL */ `
	fragment IssueFragment on Issue {
		__typename
		teamEnvironment {
			environment {
				name
			}
			team {
				slug
			}
		}
		message
		severity
		... on DeprecatedIngressIssue {
			application {
				name
			}
			ingresses
		}
		... on DeprecatedRegistryIssue {
			workload {
				__typename
				name
				image {
					name
				}
			}
		}
		... on ExternalIngressCriticalVulnerabilityIssue {
			cvssScore
			ingresses
			workload {
				__typename
				name
			}
		}
		... on LastRunFailedIssue {
			job {
				name
			}
		}
		... on FailedSynchronizationIssue {
			workload {
				__typename
				name
			}
		}
		... on InvalidSpecIssue {
			workload {
				__typename
				name
			}
		}
		... on MissingSbomIssue {
			workload {
				__typename
				name
			}
		}
		... on NoRunningInstancesIssue {
			workload {
				__typename
				name
			}
		}
		... on ApplicationRestartLoopIssue {
			workload {
				__typename
				name
			}
		}
		... on OpenSearchIssue {
			event
			openSearch {
				name
			}
		}
		... on SqlInstanceStateIssue {
			sqlInstance {
				name
			}
			state
		}
		... on SqlInstanceVersionIssue {
			sqlInstance {
				name
			}
		}
		... on ValkeyIssue {
			valkey {
				name
			}
		}
		... on VulnerableImageIssue {
			workload {
				__typename
				name
			}
		}
	}
`);
