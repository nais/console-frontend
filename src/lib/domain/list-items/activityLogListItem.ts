import { graphql as gql } from '$lib/urql/gql';

/**
 * Fragment used by `ActivityLogListItem.svelte` to render a single
 * activity-log entry. Each `... on XActivityLogEntry` selection mirrors
 * what the corresponding text component under
 * `$lib/domain/activity/shared/texts/` reads off `data`.
 *
 * The fragment is colocated as a `.ts` module (rather than inline in the
 * `.svelte` file) so callers can import and spread it from their own
 * query documents without dragging the component into a server-only
 * `load` graph.
 */
export const ActivityLogEntryFragment = gql(/* GraphQL */ `
	fragment ActivityLogEntryFragment on ActivityLogEntry {
		__typename
		id
		createdAt
		actor
		environmentName
		message
		resourceName
		resourceType
		teamSlug
		... on ApplicationDeletedActivityLogEntry {
			__typename
		}
		... on ApplicationRestartedActivityLogEntry {
			__typename
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
		... on CredentialsActivityLogEntry {
			credentialsData: data {
				permission
				ttl
			}
		}
		... on DeploymentActivityLogEntry {
			deploymentData: data {
				triggerURL
			}
		}
		... on JobDeletedActivityLogEntry {
			__typename
		}
		... on JobRunDeletedActivityLogEntry {
			jobRunDeletedData: data {
				runName
			}
		}
		... on JobTriggeredActivityLogEntry {
			__typename
		}
		... on OpenSearchCreatedActivityLogEntry {
			__typename
		}
		... on OpenSearchDeletedActivityLogEntry {
			__typename
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
		... on PostgresGrantAccessActivityLogEntry {
			__typename
			postgresGrantAccessData: data {
				grantee
				until
			}
		}
		... on RepositoryAddedActivityLogEntry {
			__typename
		}
		... on RepositoryRemovedActivityLogEntry {
			__typename
		}
		... on SecretCreatedActivityLogEntry {
			__typename
		}
		... on SecretDeletedActivityLogEntry {
			__typename
		}
		... on SecretValueAddedActivityLogEntry {
			secretValueAdded: data {
				valueName
			}
		}
		... on SecretValueRemovedActivityLogEntry {
			secretValueRemoved: data {
				valueName
			}
		}
		... on SecretValueUpdatedActivityLogEntry {
			secretValueUpdated: data {
				valueName
			}
		}
		... on SecretValuesViewedActivityLogEntry {
			secretValuesViewed: data {
				reason
			}
		}
		... on ServiceMaintenanceActivityLogEntry {
			__typename
		}
		... on TeamEnvironmentUpdatedActivityLogEntry {
			teamEnvironmentUpdated: data {
				updatedFields {
					field
					newValue
					oldValue
				}
			}
		}
		... on TeamMemberAddedActivityLogEntry {
			teamMemberAdded: data {
				role
				userEmail
			}
		}
		... on TeamMemberRemovedActivityLogEntry {
			teamMemberRemoved: data {
				userEmail
			}
		}
		... on TeamMemberSetRoleActivityLogEntry {
			teamMemberSetRole: data {
				role
				userEmail
			}
		}
		... on TeamUpdatedActivityLogEntry {
			teamUpdated: data {
				updatedFields {
					field
					newValue
					oldValue
				}
			}
		}
		... on UnleashInstanceUpdatedActivityLogEntry {
			unleashInstanceUpdated: data {
				allowedTeamSlug
				revokedTeamSlug
				updatedReleaseChannel
			}
		}
		... on ValkeyCreatedActivityLogEntry {
			__typename
		}
		... on ValkeyDeletedActivityLogEntry {
			__typename
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
		... on VulnerabilityUpdatedActivityLogEntry {
			__typename
			vulnerabilityUpdated: data {
				identifier
				package
				severity
				previousSuppression {
					reason
					state
				}
				newSuppression {
					reason
					state
				}
			}
		}
	}
`);
