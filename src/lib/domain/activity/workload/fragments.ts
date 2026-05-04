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
