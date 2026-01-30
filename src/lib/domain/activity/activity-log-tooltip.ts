// src/lib/components/activity/activity-log-tooltip.ts

/**
 * Returns a user-friendly tooltip label for an activity log entry type.
 */
export function activityTooltip(typename: string): string {
	switch (typename) {
		case 'ApplicationDeletedActivityLogEntry':
		case 'ApplicationRestartedActivityLogEntry':
		case 'ApplicationScaledActivityLogEntry':
			return 'Application';
		case 'DeploymentActivityLogEntry':
			return 'Deployment';
		case 'JobTriggeredActivityLogEntry':
		case 'JobDeletedActivityLogEntry':
			return 'Job';
		case 'SecretCreatedActivityLogEntry':
		case 'SecretDeletedActivityLogEntry':
		case 'SecretValueAddedActivityLogEntry':
		case 'SecretValueRemovedActivityLogEntry':
		case 'SecretValueUpdatedActivityLogEntry':
		case 'SecretValuesViewedActivityLogEntry':
			return 'Secret';
		case 'RepositoryAddedActivityLogEntry':
		case 'RepositoryRemovedActivityLogEntry':
			return 'Repository';
		case 'TeamMemberAddedActivityLogEntry':
		case 'TeamMemberRemovedActivityLogEntry':
		case 'TeamMemberSetRoleActivityLogEntry':
		case 'TeamCreatedActivityLogEntry':
		case 'TeamUpdatedActivityLogEntry':
		case 'TeamEnvironmentUpdatedActivityLogEntry':
		case 'TeamDeployKeyUpdatedActivityLogEntry':
			return 'Team';
		case 'UnleashInstanceCreatedActivityLogEntry':
		case 'UnleashInstanceUpdatedActivityLogEntry':
			return 'Unleash';
		case 'OpenSearchCreatedActivityLogEntry':
		case 'OpenSearchDeletedActivityLogEntry':
		case 'OpenSearchUpdatedActivityLogEntry':
			return 'OpenSearch';
		case 'ValkeyCreatedActivityLogEntry':
		case 'ValkeyDeletedActivityLogEntry':
		case 'ValkeyUpdatedActivityLogEntry':
		case 'ValkeyMaintenanceStartedActivityLogEntry':
			return 'Valkey';
		case 'VulnerabilityUpdatedActivityLogEntry':
			return 'Vulnerability';
		case 'ClusterAuditActivityLogEntry':
			return 'Kubernetes audit';
		case 'ReconcilerConfiguredActivityLogEntry':
		case 'ReconcilerEnabledActivityLogEntry':
		case 'ReconcilerDisabledActivityLogEntry':
			return 'Reconciler';
		default:
			return 'Activity';
	}
}
