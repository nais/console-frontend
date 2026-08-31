/**
 * Returns a user-friendly tooltip label for an activity log entry type.
 */
export function activityTooltip(typename: string): string {
	switch (typename) {
		case 'ConfigCreatedActivityLogEntry':
		case 'ConfigDeletedActivityLogEntry':
		case 'ConfigUpdatedActivityLogEntry':
			return 'Config';
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
		case 'SecretUpdatedActivityLogEntry':
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
		case 'KafkaCredentialsCreatedActivityLogEntry':
			return 'Kafka credentials';
		case 'OpenSearchCredentialsCreatedActivityLogEntry':
			return 'OpenSearch credentials';
		case 'ValkeyCredentialsCreatedActivityLogEntry':
			return 'Valkey credentials';
		case 'ServiceAccountCreatedActivityLogEntry':
		case 'ServiceAccountDeletedActivityLogEntry':
		case 'ServiceAccountUpdatedActivityLogEntry':
		case 'ServiceAccountTokenCreatedActivityLogEntry':
		case 'ServiceAccountTokenDeletedActivityLogEntry':
		case 'ServiceAccountTokenUpdatedActivityLogEntry':
		case 'ServiceAccountWorkloadBindingAddedActivityLogEntry':
		case 'ServiceAccountWorkloadBindingRemovedActivityLogEntry':
		case 'RoleAssignedToServiceAccountActivityLogEntry':
		case 'RoleRevokedFromServiceAccountActivityLogEntry':
			return 'Service account';
		case 'ReconcilerConfiguredActivityLogEntry':
		case 'ReconcilerEnabledActivityLogEntry':
		case 'ReconcilerDisabledActivityLogEntry':
			return 'Reconciler';
		default:
			return 'Activity';
	}
}
