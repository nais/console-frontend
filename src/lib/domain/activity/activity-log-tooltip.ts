// src/lib/components/activity/activity-log-tooltip.ts

/**
 * Returns a user-friendly tooltip label for an activity log entry type.
 */
export function activityTooltip(typename: string): string {
	switch (typename) {
		case 'ApplicationCreatedActivityLogEntry':
		case 'ApplicationDeletedActivityLogEntry':
		case 'ApplicationRestartedActivityLogEntry':
		case 'ApplicationScaledActivityLogEntry':
		case 'ApplicationUpdatedActivityLogEntry':
			return 'Application';
		case 'DeploymentActivityLogEntry':
			return 'Deployment';
		case 'ServiceMaintenanceActivityLogEntry':
			return 'Maintenance';
		case 'JobCreatedActivityLogEntry':
		case 'JobTriggeredActivityLogEntry':
		case 'JobDeletedActivityLogEntry':
		case 'JobRunDeletedActivityLogEntry':
		case 'JobUpdatedActivityLogEntry':
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
		case 'TeamConfirmDeleteKeyActivityLogEntry':
		case 'TeamCreateDeleteKeyActivityLogEntry':
		case 'TeamCreatedActivityLogEntry':
		case 'TeamUpdatedActivityLogEntry':
		case 'TeamEnvironmentUpdatedActivityLogEntry':
		case 'TeamDeployKeyUpdatedActivityLogEntry':
			return 'Team';
		case 'UnleashInstanceCreatedActivityLogEntry':
		case 'UnleashInstanceDeletedActivityLogEntry':
		case 'UnleashInstanceUpdatedActivityLogEntry':
			return 'Unleash';
		case 'GenericKubernetesResourceActivityLogEntry':
			return 'Kubernetes resource';
		case 'OpenSearchCreatedActivityLogEntry':
		case 'OpenSearchDeletedActivityLogEntry':
		case 'OpenSearchUpdatedActivityLogEntry':
			return 'OpenSearch';
		case 'PostgresDeletedActivityLogEntry':
		case 'PostgresGrantAccessActivityLogEntry':
			return 'Postgres';
		case 'ValkeyCreatedActivityLogEntry':
		case 'ValkeyDeletedActivityLogEntry':
		case 'ValkeyUpdatedActivityLogEntry':
		case 'ValkeyMaintenanceStartedActivityLogEntry':
			return 'Valkey';
		case 'VulnerabilityUpdatedActivityLogEntry':
			return 'Vulnerability';
		case 'ClusterAuditActivityLogEntry':
			return 'Kubernetes audit';
		case 'CredentialsActivityLogEntry':
			return 'Credentials';
		case 'ReconcilerConfiguredActivityLogEntry':
		case 'ReconcilerEnabledActivityLogEntry':
		case 'ReconcilerDisabledActivityLogEntry':
			return 'Reconciler';
		default:
			return 'Activity';
	}
}
