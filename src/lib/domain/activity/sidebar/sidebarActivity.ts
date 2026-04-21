import { graphql as gql } from '$lib/urql/gql';

/**
 * Fragment used by `SidebarActivity.svelte` to render the activity-log
 * sidebar shown on app/job/secret/config/valkey/opensearch detail pages
 * and on the team members/repositories/settings/secrets/configs pages.
 *
 * The fragment is colocated as a `.ts` module (rather than inline in the
 * `.svelte` file) so callers can import and spread it from their own
 * query documents.
 *
 * The `@arguments` directive from Houdini has no equivalent in vanilla
 * GraphQL fragments — callers that previously parameterized this
 * fragment with `filter` / `limit` should bake those into a sibling
 * fragment or repeat the selection inline as needed during their own
 * migration. The default selection here mirrors what the unparameterized
 * call sites used.
 */
export const SidebarActivityLogFragment = gql(/* GraphQL */ `
	fragment SidebarActivityLogFragment on ActivityLogger {
		activityLog {
			nodes {
				id
				actor
				message
				createdAt
				resourceName
				resourceType
				environmentName
				teamSlug
				__typename

				... on DeploymentActivityLogEntry {
					deploymentData: data {
						triggerURL
					}
				}
				... on ApplicationScaledActivityLogEntry {
					appScaled: data {
						newSize
						direction
					}
				}
				... on ClusterAuditActivityLogEntry {
					id
					clusterAuditData: data {
						action
						resourceKind
					}
				}

				... on RepositoryAddedActivityLogEntry {
					id
				}
				... on RepositoryRemovedActivityLogEntry {
					id
				}
				... on SecretCreatedActivityLogEntry {
					id
				}
				... on SecretDeletedActivityLogEntry {
					id
				}
				... on SecretValueAddedActivityLogEntry {
					secretValueAddedData: data {
						valueName
					}
				}
				... on SecretValueUpdatedActivityLogEntry {
					secretValueUpdatedData: data {
						valueName
					}
				}
				... on SecretValueRemovedActivityLogEntry {
					secretValueRemovedData: data {
						valueName
					}
				}
				... on SecretValuesViewedActivityLogEntry {
					secretValuesViewedData: data {
						reason
					}
				}
				... on ConfigCreatedActivityLogEntry {
					id
				}
				... on ConfigDeletedActivityLogEntry {
					id
				}
				... on ConfigUpdatedActivityLogEntry {
					configUpdatedData: data {
						updatedFields {
							field
							oldValue
							newValue
						}
					}
				}
				... on TeamEnvironmentUpdatedActivityLogEntry {
					id
					teamEnvironmentUpdatedData: data {
						updatedFields {
							field
							oldValue
							newValue
						}
					}
				}
				... on TeamDeployKeyUpdatedActivityLogEntry {
					id
				}
				... on JobRunDeletedActivityLogEntry {
					id
					jobRunDeletedData: data {
						runName
					}
				}
				... on JobTriggeredActivityLogEntry {
					id
				}
				... on TeamMemberAddedActivityLogEntry {
					addedData: data {
						role
						userEmail
						userID
					}
				}
				... on TeamMemberRemovedActivityLogEntry {
					removedData: data {
						userEmail
						userID
					}
				}
				... on TeamMemberSetRoleActivityLogEntry {
					setRoleData: data {
						role
						userEmail
						userID
					}
				}
				... on TeamUpdatedActivityLogEntry {
					id
					teamUpdatedData: data {
						updatedFields {
							field
							oldValue
							newValue
						}
					}
				}
				... on ApplicationRestartedActivityLogEntry {
					id
				}
				... on ApplicationDeletedActivityLogEntry {
					id
				}
				... on JobDeletedActivityLogEntry {
					id
				}
				... on CredentialsActivityLogEntry {
					credentialsData: data {
						permission
						ttl
					}
				}
				... on ValkeyCreatedActivityLogEntry {
					id
				}
				... on ValkeyDeletedActivityLogEntry {
					id
				}
				... on ValkeyUpdatedActivityLogEntry {
					valkeyData: data {
						updatedFields {
							field
							newValue
							oldValue
						}
					}
				}
				... on OpenSearchCreatedActivityLogEntry {
					id
				}
				... on OpenSearchDeletedActivityLogEntry {
					id
				}
				... on OpenSearchUpdatedActivityLogEntry {
					opensearchData: data {
						updatedFields {
							field
							newValue
							oldValue
						}
					}
				}
			}
		}
	}
`);
