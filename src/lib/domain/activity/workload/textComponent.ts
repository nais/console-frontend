import type { WorkloadActivityEntryFragment$data } from '$houdini';
import type { Component } from 'svelte';

import ApplicationActivityLogEntryText from './texts/ApplicationActivityLogEntryText.svelte';
import ClusterAuditActivityLogEntryText from './texts/ClusterAuditActivityLogEntryText.svelte';
import ConfigActivityLogEntryText from './texts/ConfigActivityLogEntryText.svelte';
import CredentialsActivityLogEntryText from './texts/CredentialsActivityLogEntryText.svelte';
import DefaultText from './texts/DefaultText.svelte';
import DeploymentActivityLogEntryText from './texts/DeploymentActivityLogEntryText.svelte';
import GenericKubernetesResourceActivityLogEntryText from './texts/GenericKubernetesResourceActivityLogEntryText.svelte';
import JobActivityLogEntryText from './texts/JobActivityLogEntryText.svelte';
import OpenSearchActivityLogEntryText from './texts/OpenSearchActivityLogEntryText.svelte';
import PostgresActivityLogEntryText from './texts/PostgresActivityLogEntryText.svelte';
import RepositoryActivityLogEntryText from './texts/RepositoryActivityLogEntryText.svelte';
import SecretActivityLogEntryText from './texts/SecretActivityLogEntryText.svelte';
import ServiceMaintenanceActivityLogEntryText from './texts/ServiceMaintenanceActivityLogEntryText.svelte';
import UnleashInstanceActivityLogEntryText from './texts/UnleashInstanceActivityLogEntryText.svelte';
import ValkeyActivityLogEntryText from './texts/ValkeyActivityLogEntryText.svelte';
import VulnerabilityUpdatedActivityLogEntryText from './texts/VulnerabilityUpdatedActivityLogEntryText.svelte';

export function workloadTextComponent(
	kind: WorkloadActivityEntryFragment$data['__typename']
): Component<{ data: WorkloadActivityEntryFragment$data }> {
	switch (kind) {
		case 'DeploymentActivityLogEntry':
			return DeploymentActivityLogEntryText as Component<{
				data: WorkloadActivityEntryFragment$data;
			}>;
		case 'ApplicationCreatedActivityLogEntry':
		case 'ApplicationDeletedActivityLogEntry':
		case 'ApplicationRestartedActivityLogEntry':
		case 'ApplicationScaledActivityLogEntry':
		case 'ApplicationUpdatedActivityLogEntry':
			return ApplicationActivityLogEntryText as Component<{
				data: WorkloadActivityEntryFragment$data;
			}>;
		case 'ConfigCreatedActivityLogEntry':
		case 'ConfigDeletedActivityLogEntry':
		case 'ConfigUpdatedActivityLogEntry':
			return ConfigActivityLogEntryText as Component<{
				data: WorkloadActivityEntryFragment$data;
			}>;
		case 'CredentialsActivityLogEntry':
			return CredentialsActivityLogEntryText as Component<{
				data: WorkloadActivityEntryFragment$data;
			}>;
		case 'ClusterAuditActivityLogEntry':
			return ClusterAuditActivityLogEntryText as Component<{
				data: WorkloadActivityEntryFragment$data;
			}>;
		case 'GenericKubernetesResourceActivityLogEntry':
			return GenericKubernetesResourceActivityLogEntryText as Component<{
				data: WorkloadActivityEntryFragment$data;
			}>;
		case 'JobCreatedActivityLogEntry':
		case 'JobDeletedActivityLogEntry':
		case 'JobRunDeletedActivityLogEntry':
		case 'JobTriggeredActivityLogEntry':
		case 'JobUpdatedActivityLogEntry':
			return JobActivityLogEntryText as Component<{
				data: WorkloadActivityEntryFragment$data;
			}>;
		case 'RepositoryAddedActivityLogEntry':
		case 'RepositoryRemovedActivityLogEntry':
			return RepositoryActivityLogEntryText as Component<{
				data: WorkloadActivityEntryFragment$data;
			}>;
		case 'OpenSearchCreatedActivityLogEntry':
		case 'OpenSearchDeletedActivityLogEntry':
		case 'OpenSearchUpdatedActivityLogEntry':
			return OpenSearchActivityLogEntryText as Component<{
				data: WorkloadActivityEntryFragment$data;
			}>;
		case 'PostgresDeletedActivityLogEntry':
		case 'PostgresGrantAccessActivityLogEntry':
			return PostgresActivityLogEntryText as Component<{
				data: WorkloadActivityEntryFragment$data;
			}>;
		case 'ServiceMaintenanceActivityLogEntry':
			return ServiceMaintenanceActivityLogEntryText as Component<{
				data: WorkloadActivityEntryFragment$data;
			}>;
		case 'SecretCreatedActivityLogEntry':
		case 'SecretDeletedActivityLogEntry':
		case 'SecretValueAddedActivityLogEntry':
		case 'SecretValueRemovedActivityLogEntry':
		case 'SecretValueUpdatedActivityLogEntry':
		case 'SecretValuesViewedActivityLogEntry':
			return SecretActivityLogEntryText as Component<{
				data: WorkloadActivityEntryFragment$data;
			}>;
		case 'UnleashInstanceCreatedActivityLogEntry':
		case 'UnleashInstanceDeletedActivityLogEntry':
		case 'UnleashInstanceUpdatedActivityLogEntry':
			return UnleashInstanceActivityLogEntryText as Component<{
				data: WorkloadActivityEntryFragment$data;
			}>;
		case 'ValkeyCreatedActivityLogEntry':
		case 'ValkeyDeletedActivityLogEntry':
		case 'ValkeyUpdatedActivityLogEntry':
			return ValkeyActivityLogEntryText as Component<{
				data: WorkloadActivityEntryFragment$data;
			}>;
		case 'VulnerabilityUpdatedActivityLogEntry':
			return VulnerabilityUpdatedActivityLogEntryText as Component<{
				data: WorkloadActivityEntryFragment$data;
			}>;
		default:
			return DefaultText as Component<{ data: WorkloadActivityEntryFragment$data }>;
	}
}
