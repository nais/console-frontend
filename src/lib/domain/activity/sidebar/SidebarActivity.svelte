<script lang="ts">
	import { SidebarActivityLogFragment } from '$lib/domain/activity/sidebar/sidebarActivity';
	import { useFragment, type FragmentType } from '$lib/urql/fragment';
	import type { ResultOf } from '@graphql-typed-document-node/core';
	import { Heading } from '@nais/ds-svelte-community';
	import { RocketIcon } from '@nais/ds-svelte-community/icons';
	import type { Component } from 'svelte';

	import { icons } from '../activity-log-icons';
	import ApplicationRestartedActivityLogEntryText from './texts/ApplicationRestartedActivityLogEntryText.svelte';
	import ApplicationScaledActivityLogEntryText from './texts/ApplicationScaledActivityLogEntryText.svelte';
	import ClusterAuditActivityLogEntryText from './texts/ClusterAuditActivityLogEntryText.svelte';
	import ConfigCreatedActivityLogEntryText from './texts/ConfigCreatedActivityLogEntryText.svelte';
	import ConfigDeletedActivityLogEntryText from './texts/ConfigDeletedActivityLogEntryText.svelte';
	import ConfigUpdatedActivityLogEntryText from './texts/ConfigUpdatedActivityLogEntryText.svelte';
	import CredentialsActivityLogEntryText from './texts/CredentialsActivityLogEntryText.svelte';
	import DefaultText from './texts/DefaultText.svelte';
	import DeploymentActivityLogEntryText from './texts/DeploymentActivityLogEntryText.svelte';
	import JobRunDeletedActivityLogEntryText from './texts/JobRunDeletedActivityLogEntryText.svelte';
	import JobTriggeredActivityLogEntryText from './texts/JobTriggeredActivityLogEntryText.svelte';
	import OpenSearchCreatedActivityLogEntryText from './texts/OpenSearchCreatedActivityLogEntryText.svelte';
	import OpenSearchDeletedActivityLogEntryText from './texts/OpenSearchDeletedActivityLogEntryText.svelte';
	import OpenSearchUpdatedActivityLogEntryText from './texts/OpenSearchUpdatedActivityLogEntryText.svelte';
	import RepositoryAddedActivityLogEntryText from './texts/RepositoryAddedActivityLogEntryText.svelte';
	import RepositoryRemovedActivityLogEntryText from './texts/RepositoryRemovedActivityLogEntryText.svelte';
	import ResourceDeletedActivityLogEntryText from './texts/ResourceDeletedActivityLogEntryText.svelte';
	import SecretCreatedActivityLogEntryText from './texts/SecretCreatedActivityLogEntryText.svelte';
	import SecretDeletedActivityLogEntryText from './texts/SecretDeletedActivityLogEntryText.svelte';
	import SecretValueAddedActivityLogEntryText from './texts/SecretValueAddedActivityLogEntryText.svelte';
	import SecretValueRemovedActivityLogEntryText from './texts/SecretValueRemovedActivityLogEntryText.svelte';
	import SecretValueUpdatedActivityLogEntryText from './texts/SecretValueUpdatedActivityLogEntryText.svelte';
	import SecretValuesViewedActivityLogEntryText from './texts/SecretValuesViewedActivityLogEntryText.svelte';
	import TeamEnvironmentUpdatedActivityLogEntryText from './texts/TeamEnvironmentUpdatedActivityLogEntryText.svelte';
	import TeamMemberAddedActivityLogEntryText from './texts/TeamMemberAddedActivityLogEntryText.svelte';
	import TeamMemberRemovedActivityLogEntryText from './texts/TeamMemberRemovedActivityLogEntryText.svelte';
	import TeamMemberSetRoleActivityLogEntryText from './texts/TeamMemberSetRoleActivityLogEntryText.svelte';
	import TeamUpdatedActivityLogEntryText from './texts/TeamUpdatedActivityLogEntryText.svelte';
	import ValkeyCreatedActivityLogEntryText from './texts/ValkeyCreatedActivityLogEntryText.svelte';
	import ValkeyDeletedActivityLogEntryText from './texts/ValkeyDeletedActivityLogEntryText.svelte';
	import ValkeyUpdatedActivityLogEntryText from './texts/ValkeyUpdatedActivityLogEntryText.svelte';

	type SidebarActivityLogFragmentData = ResultOf<typeof SidebarActivityLogFragment>;

	interface Props {
		activityLog: FragmentType<typeof SidebarActivityLogFragment>;
		direct?: SidebarActivityLogFragmentData['activityLog'];
	}

	let { activityLog, direct }: Props = $props();

	const data = $derived(useFragment(SidebarActivityLogFragment, activityLog));

	type Kind =
		| SidebarActivityLogFragmentData['activityLog']['nodes'][number]['__typename']
		| 'JobTriggeredActivityLogEntry';

	function textComponent(kind: Kind): Component<{ data: unknown }> {
		switch (kind) {
			case 'DeploymentActivityLogEntry':
				return DeploymentActivityLogEntryText as Component<{ data: unknown }>;
			case 'ApplicationScaledActivityLogEntry':
				return ApplicationScaledActivityLogEntryText as Component<{ data: unknown }>;
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
			case 'JobRunDeletedActivityLogEntry':
				return JobRunDeletedActivityLogEntryText as Component<{ data: unknown }>;
			case 'JobTriggeredActivityLogEntry':
				return JobTriggeredActivityLogEntryText as Component<{ data: unknown }>;
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
			case 'ClusterAuditActivityLogEntry':
				return ClusterAuditActivityLogEntryText as Component<{ data: unknown }>;
			case 'ApplicationDeletedActivityLogEntry':
			case 'JobDeletedActivityLogEntry':
				return ResourceDeletedActivityLogEntryText as Component<{ data: unknown }>;
			case 'ApplicationRestartedActivityLogEntry':
				return ApplicationRestartedActivityLogEntryText as Component<{ data: unknown }>;
			case 'CredentialsActivityLogEntry':
				return CredentialsActivityLogEntryText as Component<{ data: unknown }>;
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
			default:
				return DefaultText as Component<{ data: unknown }>;
		}
	}

	const list = $derived(data ? data.activityLog.nodes : (direct?.nodes ?? []));
</script>

<div class="wrapper">
	<Heading as="h3" size="small">Activity</Heading>
	{#each list as entry (entry.id)}
		{@const Icon = icons[entry.__typename] || RocketIcon}
		{@const TextComponent = textComponent(entry.__typename)}
		<div class="item">
			<div class="icon">
				<Icon width="75%" height="75%" />
			</div>
			<div class="content">
				<TextComponent data={entry} />
			</div>
		</div>
	{:else}
		<p>No activity log entries found.</p>
	{/each}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
		min-width: 0;
	}
	.item {
		display: flex;
		position: relative;
		padding-bottom: 0.75rem;
	}
	.icon {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 30px;
		height: 30px;
		min-width: 30px;
		min-height: 30px;
		background: var(--ax-bg-raised);
		z-index: 1;
		border-radius: 50%;
	}
	.content {
		flex: 1 1 auto;
		min-width: 0;
		overflow-wrap: anywhere;
		padding: 0 0 0 1rem;
	}
	.item:not(:last-child)::before {
		background: var(--ax-border-neutral-subtleA);
		content: '';
		height: 100%;
		left: 14px;
		position: absolute;
		top: 20px;
		width: 2px;
		z-index: 0;
	}
</style>
