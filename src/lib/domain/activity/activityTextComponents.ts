import type { Component } from 'svelte';

import ApplicationCreatedActivityLogEntryText from './shared/texts/ApplicationCreatedActivityLogEntryText.svelte';
import ApplicationDeletedActivityLogEntryText from './shared/texts/ApplicationDeletedActivityLogEntryText.svelte';
import ApplicationRestartedActivityLogEntryText from './shared/texts/ApplicationRestartedActivityLogEntryText.svelte';
import ApplicationScaledActivityLogEntryText from './shared/texts/ApplicationScaledActivityLogEntryText.svelte';
import ApplicationUpdatedActivityLogEntryText from './shared/texts/ApplicationUpdatedActivityLogEntryText.svelte';
import ClusterAuditActivityLogEntryText from './shared/texts/ClusterAuditActivityLogEntryText.svelte';
import ConfigCreatedActivityLogEntryText from './shared/texts/ConfigCreatedActivityLogEntryText.svelte';
import ConfigDeletedActivityLogEntryText from './shared/texts/ConfigDeletedActivityLogEntryText.svelte';
import ConfigUpdatedActivityLogEntryText from './shared/texts/ConfigUpdatedActivityLogEntryText.svelte';
import CredentialsActivityLogEntryText from './shared/texts/CredentialsActivityLogEntryText.svelte';
import DefaultText from './shared/texts/DefaultText.svelte';
import DeploymentActivityLogEntryText from './shared/texts/DeploymentActivityLogEntryText.svelte';
import GenericKubernetesResourceActivityLogEntryText from './shared/texts/GenericKubernetesResourceActivityLogEntryText.svelte';
import JobCreatedActivityLogEntryText from './shared/texts/JobCreatedActivityLogEntryText.svelte';
import JobDeletedActivityLogEntryText from './shared/texts/JobDeletedActivityLogEntryText.svelte';
import JobRunDeletedActivityLogEntryText from './shared/texts/JobRunDeletedActivityLogEntryText.svelte';
import JobTriggeredActivityLogEntryText from './shared/texts/JobTriggeredActivityLogEntryText.svelte';
import JobUpdatedActivityLogEntryText from './shared/texts/JobUpdatedActivityLogEntryText.svelte';
import OpenSearchCreatedActivityLogEntryText from './shared/texts/OpenSearchCreatedActivityLogEntryText.svelte';
import OpenSearchDeletedActivityLogEntryText from './shared/texts/OpenSearchDeletedActivityLogEntryText.svelte';
import OpenSearchUpdatedActivityLogEntryText from './shared/texts/OpenSearchUpdatedActivityLogEntryText.svelte';
import PostgresDeletedActivityLogEntryText from './shared/texts/PostgresDeletedActivityLogEntryText.svelte';
import PostgresGrantAccessActivityLogEntryText from './shared/texts/PostgresGrantAccessActivityLogEntryText.svelte';
import RepositoryAddedActivityLogEntryText from './shared/texts/RepositoryAddedActivityLogEntryText.svelte';
import RepositoryRemovedActivityLogEntryText from './shared/texts/RepositoryRemovedActivityLogEntryText.svelte';
import SecretCreatedActivityLogEntryText from './shared/texts/SecretCreatedActivityLogEntryText.svelte';
import SecretDeletedActivityLogEntryText from './shared/texts/SecretDeletedActivityLogEntryText.svelte';
import SecretUpdatedActivityLogEntryText from './shared/texts/SecretUpdatedActivityLogEntryText.svelte';
import SecretValueAddedActivityLogEntryText from './shared/texts/SecretValueAddedActivityLogEntryText.svelte';
import SecretValueRemovedActivityLogEntryText from './shared/texts/SecretValueRemovedActivityLogEntryText.svelte';
import SecretValueUpdatedActivityLogEntryText from './shared/texts/SecretValueUpdatedActivityLogEntryText.svelte';
import SecretValuesViewedActivityLogEntryText from './shared/texts/SecretValuesViewedActivityLogEntryText.svelte';
import ServiceMaintenanceActivityLogEntryText from './shared/texts/ServiceMaintenanceActivityLogEntryText.svelte';
import TeamConfirmDeleteKeyActivityLogEntryText from './shared/texts/TeamConfirmDeleteKeyActivityLogEntryText.svelte';
import TeamCreateDeleteKeyActivityLogEntryText from './shared/texts/TeamCreateDeleteKeyActivityLogEntryText.svelte';
import TeamCreatedActivityLogEntryText from './shared/texts/TeamCreatedActivityLogEntryText.svelte';
import TeamDeployKeyUpdatedActivityLogEntryText from './shared/texts/TeamDeployKeyUpdatedActivityLogEntryText.svelte';
import TeamEnvironmentUpdatedActivityLogEntryText from './shared/texts/TeamEnvironmentUpdatedActivityLogEntryText.svelte';
import TeamMemberAddedActivityLogEntryText from './shared/texts/TeamMemberAddedActivityLogEntryText.svelte';
import TeamMemberRemovedActivityLogEntryText from './shared/texts/TeamMemberRemovedActivityLogEntryText.svelte';
import TeamMemberSetRoleActivityLogEntryText from './shared/texts/TeamMemberSetRoleActivityLogEntryText.svelte';
import TeamUpdatedActivityLogEntryText from './shared/texts/TeamUpdatedActivityLogEntryText.svelte';
import UnleashInstanceCreatedActivityLogEntryText from './shared/texts/UnleashInstanceCreatedActivityLogEntryText.svelte';
import UnleashInstanceDeletedActivityLogEntryText from './shared/texts/UnleashInstanceDeletedActivityLogEntryText.svelte';
import UnleashInstanceUpdatedActivityLogEntryText from './shared/texts/UnleashInstanceUpdatedActivityLogEntryText.svelte';
import ValkeyCreatedActivityLogEntryText from './shared/texts/ValkeyCreatedActivityLogEntryText.svelte';
import ValkeyDeletedActivityLogEntryText from './shared/texts/ValkeyDeletedActivityLogEntryText.svelte';
import ValkeyUpdatedActivityLogEntryText from './shared/texts/ValkeyUpdatedActivityLogEntryText.svelte';
import VulnerabilityUpdatedActivityLogEntryText from './shared/texts/VulnerabilityUpdatedActivityLogEntryText.svelte';
import type { TimelineModes } from './shared/texts/types';

type textComponentProps = {
	data: unknown;
	mode?: TimelineModes;
};

export function activityTextComponent(typename: string | null): Component<textComponentProps> {
	switch (typename) {
		case 'ApplicationDeletedActivityLogEntry':
			return ApplicationDeletedActivityLogEntryText as Component<textComponentProps>;
		case 'ApplicationCreatedActivityLogEntry':
			return ApplicationCreatedActivityLogEntryText as Component<textComponentProps>;
		case 'ApplicationRestartedActivityLogEntry':
			return ApplicationRestartedActivityLogEntryText as Component<textComponentProps>;
		case 'ApplicationScaledActivityLogEntry':
			return ApplicationScaledActivityLogEntryText as Component<textComponentProps>;
		case 'ApplicationUpdatedActivityLogEntry':
			return ApplicationUpdatedActivityLogEntryText as Component<textComponentProps>;
		case 'ClusterAuditActivityLogEntry':
			return ClusterAuditActivityLogEntryText as Component<textComponentProps>;
		case 'ConfigCreatedActivityLogEntry':
			return ConfigCreatedActivityLogEntryText as Component<textComponentProps>;
		case 'ConfigDeletedActivityLogEntry':
			return ConfigDeletedActivityLogEntryText as Component<textComponentProps>;
		case 'ConfigUpdatedActivityLogEntry':
			return ConfigUpdatedActivityLogEntryText as Component<textComponentProps>;
		case 'CredentialsActivityLogEntry':
			return CredentialsActivityLogEntryText as Component<textComponentProps>;
		case 'DeploymentActivityLogEntry':
			return DeploymentActivityLogEntryText as Component<textComponentProps>;
		case 'GenericKubernetesResourceActivityLogEntry':
			return GenericKubernetesResourceActivityLogEntryText as Component<textComponentProps>;
		case 'JobCreatedActivityLogEntry':
			return JobCreatedActivityLogEntryText as Component<textComponentProps>;
		case 'JobDeletedActivityLogEntry':
			return JobDeletedActivityLogEntryText as Component<textComponentProps>;
		case 'JobRunDeletedActivityLogEntry':
			return JobRunDeletedActivityLogEntryText as Component<textComponentProps>;
		case 'JobTriggeredActivityLogEntry':
			return JobTriggeredActivityLogEntryText as Component<textComponentProps>;
		case 'JobUpdatedActivityLogEntry':
			return JobUpdatedActivityLogEntryText as Component<textComponentProps>;
		case 'OpenSearchCreatedActivityLogEntry':
			return OpenSearchCreatedActivityLogEntryText as Component<textComponentProps>;
		case 'OpenSearchDeletedActivityLogEntry':
			return OpenSearchDeletedActivityLogEntryText as Component<textComponentProps>;
		case 'OpenSearchUpdatedActivityLogEntry':
			return OpenSearchUpdatedActivityLogEntryText as Component<textComponentProps>;
		case 'PostgresDeletedActivityLogEntry':
			return PostgresDeletedActivityLogEntryText as Component<textComponentProps>;
		case 'PostgresGrantAccessActivityLogEntry':
			return PostgresGrantAccessActivityLogEntryText as Component<textComponentProps>;
		case 'RepositoryAddedActivityLogEntry':
			return RepositoryAddedActivityLogEntryText as Component<textComponentProps>;
		case 'RepositoryRemovedActivityLogEntry':
			return RepositoryRemovedActivityLogEntryText as Component<textComponentProps>;
		case 'SecretUpdatedActivityLogEntry':
			return SecretUpdatedActivityLogEntryText as Component<textComponentProps>;
		case 'SecretCreatedActivityLogEntry':
			return SecretCreatedActivityLogEntryText as Component<textComponentProps>;
		case 'SecretDeletedActivityLogEntry':
			return SecretDeletedActivityLogEntryText as Component<textComponentProps>;
		case 'SecretValueAddedActivityLogEntry':
			return SecretValueAddedActivityLogEntryText as Component<textComponentProps>;
		case 'SecretValueRemovedActivityLogEntry':
			return SecretValueRemovedActivityLogEntryText as Component<textComponentProps>;
		case 'SecretValueUpdatedActivityLogEntry':
			return SecretValueUpdatedActivityLogEntryText as Component<textComponentProps>;
		case 'SecretValuesViewedActivityLogEntry':
			return SecretValuesViewedActivityLogEntryText as Component<textComponentProps>;
		case 'ServiceMaintenanceActivityLogEntry':
			return ServiceMaintenanceActivityLogEntryText as Component<textComponentProps>;
		case 'TeamConfirmDeleteKeyActivityLogEntry':
			return TeamConfirmDeleteKeyActivityLogEntryText as Component<textComponentProps>;
		case 'TeamCreateDeleteKeyActivityLogEntry':
			return TeamCreateDeleteKeyActivityLogEntryText as Component<textComponentProps>;
		case 'TeamCreatedActivityLogEntry':
			return TeamCreatedActivityLogEntryText as Component<textComponentProps>;
		case 'TeamDeployKeyUpdatedActivityLogEntry':
			return TeamDeployKeyUpdatedActivityLogEntryText as Component<textComponentProps>;
		case 'TeamEnvironmentUpdatedActivityLogEntry':
			return TeamEnvironmentUpdatedActivityLogEntryText as Component<textComponentProps>;
		case 'TeamMemberAddedActivityLogEntry':
			return TeamMemberAddedActivityLogEntryText as Component<textComponentProps>;
		case 'TeamMemberRemovedActivityLogEntry':
			return TeamMemberRemovedActivityLogEntryText as Component<textComponentProps>;
		case 'TeamMemberSetRoleActivityLogEntry':
			return TeamMemberSetRoleActivityLogEntryText as Component<textComponentProps>;
		case 'TeamUpdatedActivityLogEntry':
			return TeamUpdatedActivityLogEntryText as Component<textComponentProps>;
		case 'UnleashInstanceCreatedActivityLogEntry':
			return UnleashInstanceCreatedActivityLogEntryText as Component<textComponentProps>;
		case 'UnleashInstanceDeletedActivityLogEntry':
			return UnleashInstanceDeletedActivityLogEntryText as Component<textComponentProps>;
		case 'UnleashInstanceUpdatedActivityLogEntry':
			return UnleashInstanceUpdatedActivityLogEntryText as Component<textComponentProps>;
		case 'ValkeyCreatedActivityLogEntry':
			return ValkeyCreatedActivityLogEntryText as Component<textComponentProps>;
		case 'ValkeyDeletedActivityLogEntry':
			return ValkeyDeletedActivityLogEntryText as Component<textComponentProps>;
		case 'ValkeyUpdatedActivityLogEntry':
			return ValkeyUpdatedActivityLogEntryText as Component<textComponentProps>;
		case 'VulnerabilityUpdatedActivityLogEntry':
			return VulnerabilityUpdatedActivityLogEntryText as Component<textComponentProps>;
		default:
			return DefaultText as Component<textComponentProps>;
	}
}
