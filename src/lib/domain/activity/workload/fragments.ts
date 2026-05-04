import { graphql } from '$houdini';

export const workloadActivityEntryFragment = graphql(`
	fragment WorkloadActivityEntryFragment on ActivityLogEntry {
		__typename
		id
		actor
		createdAt
		message
		resourceName
		resourceType
		environmentName
		teamSlug
		... on ApplicationCreatedActivityLogEntry {
			__typename
		}
		... on ApplicationDeletedActivityLogEntry {
			__typename
		}
		... on ApplicationRestartedActivityLogEntry {
			__typename
		}
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
		... on ApplicationUpdatedActivityLogEntry {
			applicationUpdated: data {
				changedFields {
					field
				}
			}
		}
		... on ClusterAuditActivityLogEntry {
			clusterAuditData: data {
				action
				resourceKind
			}
		}
		... on JobRunDeletedActivityLogEntry {
			jobRunDeleted: data {
				runName
			}
		}
		... on JobCreatedActivityLogEntry {
			__typename
		}
		... on JobDeletedActivityLogEntry {
			__typename
		}
		... on JobTriggeredActivityLogEntry {
			__typename
		}
		... on JobUpdatedActivityLogEntry {
			jobUpdated: data {
				changedFields {
					field
				}
			}
		}
		... on ConfigCreatedActivityLogEntry {
			__typename
		}
		... on ConfigDeletedActivityLogEntry {
			__typename
		}
		... on ConfigUpdatedActivityLogEntry {
			configUpdated: data {
				updatedFields {
					field
				}
			}
		}
		... on GenericKubernetesResourceActivityLogEntry {
			genericKubernetesData: data {
				kind
				changedFields {
					field
				}
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
			__typename
		}
		... on CredentialsActivityLogEntry {
			credentialsData: data {
				permission
			}
		}
		... on ServiceMaintenanceActivityLogEntry {
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
				}
			}
		}
		... on PostgresDeletedActivityLogEntry {
			__typename
		}
		... on PostgresGrantAccessActivityLogEntry {
			postgresGrantAccessData: data {
				grantee
			}
		}
		... on UnleashInstanceCreatedActivityLogEntry {
			__typename
		}
		... on UnleashInstanceDeletedActivityLogEntry {
			__typename
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
				}
			}
		}
		... on VulnerabilityUpdatedActivityLogEntry {
			vulnerabilityUpdated: data {
				identifier
				package
				severity
				previousSuppression {
					state
				}
				newSuppression {
					state
				}
			}
		}
	}
`);

export const workloadLatestActivityFragment = graphql(`
	fragment WorkloadLatestActivityFragment on ActivityLogger @arguments(limit: { type: "Int" }) {
		activityLog(first: $limit) {
			nodes {
				...WorkloadActivityEntryFragment
			}
		}
	}
`);
