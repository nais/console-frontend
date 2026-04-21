import { graphql as gql } from '$lib/urql/gql';

export const TeamOverviewActivityLogQuery = gql(/* GraphQL */ `
	query TeamOverviewActivityLog($teamSlug: Slug!, $filter: ActivityLogFilter) {
		team(slug: $teamSlug) {
			activityLog(first: 10, filter: $filter) {
				edges {
					node {
						id
						actor
						message
						createdAt
						resourceName
						resourceType
						__typename
						environmentName
						teamSlug
						... on ApplicationScaledActivityLogEntry {
							appScaled: data {
								newSize
								direction
							}
						}
						... on ClusterAuditActivityLogEntry {
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
						... on OpenSearchUpdatedActivityLogEntry {
							opensearchData: data {
								updatedFields {
									field
									newValue
									oldValue
								}
							}
						}
						... on SecretValueAddedActivityLogEntry {
							secretValueAddedData: data {
								valueName
							}
						}
						... on SecretValueRemovedActivityLogEntry {
							secretValueRemovedData: data {
								valueName
							}
						}
						... on SecretValueUpdatedActivityLogEntry {
							secretValueUpdatedData: data {
								valueName
							}
						}
						... on SecretValuesViewedActivityLogEntry {
							secretValuesViewedData: data {
								reason
							}
						}
						... on TeamMemberAddedActivityLogEntry {
							addedData: data {
								role
								userEmail
							}
						}
						... on TeamMemberRemovedActivityLogEntry {
							removedData: data {
								userEmail
							}
						}
						... on TeamMemberSetRoleActivityLogEntry {
							setRoleData: data {
								role
								userEmail
							}
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
						... on JobRunDeletedActivityLogEntry {
							jobRunDeletedData: data {
								runName
							}
						}
					}
				}
			}
		}
	}
`);
