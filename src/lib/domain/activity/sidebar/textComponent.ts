import type { Component } from 'svelte';

import ApplicationCreatedActivityLogEntryText from './texts/ApplicationCreatedActivityLogEntryText.svelte';
import ApplicationRestartedActivityLogEntryText from './texts/ApplicationRestartedActivityLogEntryText.svelte';
import ApplicationScaledActivityLogEntryText from './texts/ApplicationScaledActivityLogEntryText.svelte';
import ApplicationUpdatedActivityLogEntryText from './texts/ApplicationUpdatedActivityLogEntryText.svelte';
import ClusterAuditActivityLogEntryText from './texts/ClusterAuditActivityLogEntryText.svelte';
import ConfigCreatedActivityLogEntryText from './texts/ConfigCreatedActivityLogEntryText.svelte';
import ConfigDeletedActivityLogEntryText from './texts/ConfigDeletedActivityLogEntryText.svelte';
import ConfigUpdatedActivityLogEntryText from './texts/ConfigUpdatedActivityLogEntryText.svelte';
import CredentialsActivityLogEntryText from './texts/CredentialsActivityLogEntryText.svelte';
import DefaultText from './texts/DefaultText.svelte';
import DeploymentActivityLogEntryText from './texts/DeploymentActivityLogEntryText.svelte';
import GenericKubernetesResourceActivityLogEntryText from './texts/GenericKubernetesResourceActivityLogEntryText.svelte';
import JobCreatedActivityLogEntryText from './texts/JobCreatedActivityLogEntryText.svelte';
import JobRunDeletedActivityLogEntryText from './texts/JobRunDeletedActivityLogEntryText.svelte';
import JobTriggeredActivityLogEntryText from './texts/JobTriggeredActivityLogEntryText.svelte';
import JobUpdatedActivityLogEntryText from './texts/JobUpdatedActivityLogEntryText.svelte';
import OpenSearchCreatedActivityLogEntryText from './texts/OpenSearchCreatedActivityLogEntryText.svelte';
import OpenSearchDeletedActivityLogEntryText from './texts/OpenSearchDeletedActivityLogEntryText.svelte';
import OpenSearchUpdatedActivityLogEntryText from './texts/OpenSearchUpdatedActivityLogEntryText.svelte';
import PostgresDeletedActivityLogEntryText from './texts/PostgresDeletedActivityLogEntryText.svelte';
import PostgresGrantAccessActivityLogEntryText from './texts/PostgresGrantAccessActivityLogEntryText.svelte';
import RepositoryAddedActivityLogEntryText from './texts/RepositoryAddedActivityLogEntryText.svelte';
import RepositoryRemovedActivityLogEntryText from './texts/RepositoryRemovedActivityLogEntryText.svelte';
import ResourceDeletedActivityLogEntryText from './texts/ResourceDeletedActivityLogEntryText.svelte';
import SecretCreatedActivityLogEntryText from './texts/SecretCreatedActivityLogEntryText.svelte';
import SecretDeletedActivityLogEntryText from './texts/SecretDeletedActivityLogEntryText.svelte';
import SecretValueAddedActivityLogEntryText from './texts/SecretValueAddedActivityLogEntryText.svelte';
import SecretValueRemovedActivityLogEntryText from './texts/SecretValueRemovedActivityLogEntryText.svelte';
import SecretValueUpdatedActivityLogEntryText from './texts/SecretValueUpdatedActivityLogEntryText.svelte';
import SecretValuesViewedActivityLogEntryText from './texts/SecretValuesViewedActivityLogEntryText.svelte';
import ServiceMaintenanceActivityLogEntryText from './texts/ServiceMaintenanceActivityLogEntryText.svelte';
import TeamConfirmDeleteKeyActivityLogEntryText from './texts/TeamConfirmDeleteKeyActivityLogEntryText.svelte';
import TeamCreateDeleteKeyActivityLogEntryText from './texts/TeamCreateDeleteKeyActivityLogEntryText.svelte';
import TeamCreatedActivityLogEntryText from './texts/TeamCreatedActivityLogEntryText.svelte';
import TeamDeployKeyUpdatedActivityLogEntryText from './texts/TeamDeployKeyUpdatedActivityLogEntryText.svelte';
import TeamEnvironmentUpdatedActivityLogEntryText from './texts/TeamEnvironmentUpdatedActivityLogEntryText.svelte';
import TeamMemberAddedActivityLogEntryText from './texts/TeamMemberAddedActivityLogEntryText.svelte';
import TeamMemberRemovedActivityLogEntryText from './texts/TeamMemberRemovedActivityLogEntryText.svelte';
import TeamMemberSetRoleActivityLogEntryText from './texts/TeamMemberSetRoleActivityLogEntryText.svelte';
import TeamUpdatedActivityLogEntryText from './texts/TeamUpdatedActivityLogEntryText.svelte';
import UnleashInstanceCreatedActivityLogEntryText from './texts/UnleashInstanceCreatedActivityLogEntryText.svelte';
import UnleashInstanceDeletedActivityLogEntryText from './texts/UnleashInstanceDeletedActivityLogEntryText.svelte';
import UnleashInstanceUpdatedActivityLogEntryText from './texts/UnleashInstanceUpdatedActivityLogEntryText.svelte';
import ValkeyCreatedActivityLogEntryText from './texts/ValkeyCreatedActivityLogEntryText.svelte';
import ValkeyDeletedActivityLogEntryText from './texts/ValkeyDeletedActivityLogEntryText.svelte';
import ValkeyUpdatedActivityLogEntryText from './texts/ValkeyUpdatedActivityLogEntryText.svelte';
import VulnerabilityUpdatedActivityLogEntryText from './texts/VulnerabilityUpdatedActivityLogEntryText.svelte';

export function sidebarTextComponent(kind: string): Component<{ data: unknown }> {
	switch (kind) {
		case 'DeploymentActivityLogEntry':
			return DeploymentActivityLogEntryText as Component<{ data: unknown }>;
		case 'ApplicationCreatedActivityLogEntry':
			return ApplicationCreatedActivityLogEntryText as Component<{ data: unknown }>;
		case 'ApplicationScaledActivityLogEntry':
			return ApplicationScaledActivityLogEntryText as Component<{ data: unknown }>;
		case 'ApplicationUpdatedActivityLogEntry':
			return ApplicationUpdatedActivityLogEntryText as Component<{ data: unknown }>;
		case 'GenericKubernetesResourceActivityLogEntry':
			return GenericKubernetesResourceActivityLogEntryText as Component<{ data: unknown }>;
		case 'RepositoryAddedActivityLogEntry':
			return RepositoryAddedActivityLogEntryText as Component<{ data: unknown }>;
		case 'RepositoryRemovedActivityLogEntry':
			return RepositoryRemovedActivityLogEntryText as Component<{ data: unknown }>;
		case 'SecretValueAddedActivityLogEntry':
			return SecretValueAddedActivityLogEntryText as Component<{ data: unknown }>;
		case 'SecretValueUpdatedActivityLogEntry':
			return SecretValueUpdatedActivityLogEntryText as Component<{ data: unknown }>;
		case 'SecretValueRemovedActivityLogEntry':
			return SecretValueRemovedActivityLogEntryText as Component<{ data: unknown }>;
		case 'SecretCreatedActivityLogEntry':
			return SecretCreatedActivityLogEntryText as Component<{ data: unknown }>;
		case 'SecretDeletedActivityLogEntry':
			return SecretDeletedActivityLogEntryText as Component<{ data: unknown }>;
		case 'SecretValuesViewedActivityLogEntry':
			return SecretValuesViewedActivityLogEntryText as Component<{ data: unknown }>;
		case 'ConfigCreatedActivityLogEntry':
			return ConfigCreatedActivityLogEntryText as Component<{ data: unknown }>;
		case 'ConfigDeletedActivityLogEntry':
			return ConfigDeletedActivityLogEntryText as Component<{ data: unknown }>;
		case 'ConfigUpdatedActivityLogEntry':
			return ConfigUpdatedActivityLogEntryText as Component<{ data: unknown }>;
		case 'JobCreatedActivityLogEntry':
			return JobCreatedActivityLogEntryText as Component<{ data: unknown }>;
		case 'JobRunDeletedActivityLogEntry':
			return JobRunDeletedActivityLogEntryText as Component<{ data: unknown }>;
		case 'JobTriggeredActivityLogEntry':
			return JobTriggeredActivityLogEntryText as Component<{ data: unknown }>;
		case 'JobUpdatedActivityLogEntry':
			return JobUpdatedActivityLogEntryText as Component<{ data: unknown }>;
		case 'TeamConfirmDeleteKeyActivityLogEntry':
			return TeamConfirmDeleteKeyActivityLogEntryText as Component<{ data: unknown }>;
		case 'TeamCreateDeleteKeyActivityLogEntry':
			return TeamCreateDeleteKeyActivityLogEntryText as Component<{ data: unknown }>;
		case 'TeamCreatedActivityLogEntry':
			return TeamCreatedActivityLogEntryText as Component<{ data: unknown }>;
		case 'TeamDeployKeyUpdatedActivityLogEntry':
			return TeamDeployKeyUpdatedActivityLogEntryText as Component<{ data: unknown }>;
		case 'TeamEnvironmentUpdatedActivityLogEntry':
			return TeamEnvironmentUpdatedActivityLogEntryText as Component<{ data: unknown }>;
		case 'TeamMemberAddedActivityLogEntry':
			return TeamMemberAddedActivityLogEntryText as Component<{ data: unknown }>;
		case 'TeamMemberRemovedActivityLogEntry':
			return TeamMemberRemovedActivityLogEntryText as Component<{ data: unknown }>;
		case 'TeamMemberSetRoleActivityLogEntry':
			return TeamMemberSetRoleActivityLogEntryText as Component<{ data: unknown }>;
		case 'TeamUpdatedActivityLogEntry':
			return TeamUpdatedActivityLogEntryText as Component<{ data: unknown }>;
		case 'UnleashInstanceUpdatedActivityLogEntry':
			return UnleashInstanceUpdatedActivityLogEntryText as Component<{ data: unknown }>;
		case 'ClusterAuditActivityLogEntry':
			return ClusterAuditActivityLogEntryText as Component<{ data: unknown }>;
		case 'ApplicationDeletedActivityLogEntry':
		case 'JobDeletedActivityLogEntry':
			return ResourceDeletedActivityLogEntryText as Component<{ data: unknown }>;
		case 'ApplicationRestartedActivityLogEntry':
			return ApplicationRestartedActivityLogEntryText as Component<{ data: unknown }>;
		case 'CredentialsActivityLogEntry':
			return CredentialsActivityLogEntryText as Component<{ data: unknown }>;
		case 'ServiceMaintenanceActivityLogEntry':
			return ServiceMaintenanceActivityLogEntryText as Component<{ data: unknown }>;
		case 'ValkeyCreatedActivityLogEntry':
			return ValkeyCreatedActivityLogEntryText as Component<{ data: unknown }>;
		case 'ValkeyDeletedActivityLogEntry':
			return ValkeyDeletedActivityLogEntryText as Component<{ data: unknown }>;
		case 'ValkeyUpdatedActivityLogEntry':
			return ValkeyUpdatedActivityLogEntryText as Component<{ data: unknown }>;
		case 'OpenSearchCreatedActivityLogEntry':
			return OpenSearchCreatedActivityLogEntryText as Component<{ data: unknown }>;
		case 'OpenSearchDeletedActivityLogEntry':
			return OpenSearchDeletedActivityLogEntryText as Component<{ data: unknown }>;
		case 'OpenSearchUpdatedActivityLogEntry':
			return OpenSearchUpdatedActivityLogEntryText as Component<{ data: unknown }>;
		case 'PostgresDeletedActivityLogEntry':
			return PostgresDeletedActivityLogEntryText as Component<{ data: unknown }>;
		case 'PostgresGrantAccessActivityLogEntry':
			return PostgresGrantAccessActivityLogEntryText as Component<{ data: unknown }>;
		case 'UnleashInstanceCreatedActivityLogEntry':
			return UnleashInstanceCreatedActivityLogEntryText as Component<{ data: unknown }>;
		case 'UnleashInstanceDeletedActivityLogEntry':
			return UnleashInstanceDeletedActivityLogEntryText as Component<{ data: unknown }>;
		case 'VulnerabilityUpdatedActivityLogEntry':
			return VulnerabilityUpdatedActivityLogEntryText as Component<{ data: unknown }>;
		default:
			return DefaultText as Component<{ data: unknown }>;
	}
}
