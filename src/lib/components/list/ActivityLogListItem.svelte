<script lang="ts">
	import { fragment, graphql, type ActivityLogEntryFragment } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';
	import { RocketIcon } from '@nais/ds-svelte-community/icons';
	import type { Component } from 'svelte';
	import { activityIconClassFromEntry, icons } from '../activity/activity-log-icons';
	import '../activity/activity-log.css';
	import ApplicationDeletedActivityLogEntryText from '../activity/list/texts/ApplicationDeletedActivityLogEntryText.svelte';
	import ApplicationRestartedActivityLogEntryText from '../activity/list/texts/ApplicationRestartedActivityLogEntryText.svelte';
	import ApplicationScaledActivityLogEntryText from '../activity/list/texts/ApplicationScaledActivityLogEntryText.svelte';
	import ClusterAuditActivityLogEntryText from '../activity/list/texts/ClusterAuditActivityLogEntryText.svelte';
	import DeploymentActivityLogEntryText from '../activity/list/texts/DeploymentActivityLogEntryText.svelte';
	import JobDeletedActivityLogEntryText from '../activity/list/texts/JobDeletedActivityLogEntryText.svelte';
	import JobTriggeredActivityLogEntryText from '../activity/list/texts/JobTriggeredActivityLogEntryText.svelte';
	import OpenSearchCreatedActivityLogEntryText from '../activity/list/texts/OpenSearchCreatedActivityLogEntryText.svelte';
	import OpenSearchDeletedActivityLogEntryText from '../activity/list/texts/OpenSearchDeletedActivityLogEntryText.svelte';
	import OpenSearchUpdatedActivityLogEntryText from '../activity/list/texts/OpenSearchUpdatedActivityLogEntryText.svelte';
	import RepositoryAddedActivityLogEntryText from '../activity/list/texts/RepositoryAddedActivityLogEntryText.svelte';
	import RepositoryRemovedActivityLogEntryText from '../activity/list/texts/RepositoryRemovedActivityLogEntryText.svelte';
	import SecretCreatedActivityLogEntryText from '../activity/list/texts/SecretCreatedActivityLogEntryText.svelte';
	import SecretDeletedActivityLogEntryText from '../activity/list/texts/SecretDeletedActivityLogEntryText.svelte';
	import SecretValueAddedActivityLogEntryText from '../activity/list/texts/SecretValueAddedActivityLogEntryText.svelte';
	import SecretValueRemovedActivityLogEntryText from '../activity/list/texts/SecretValueRemovedActivityLogEntryText.svelte';
	import SecretValueUpdatedActivityLogEntryText from '../activity/list/texts/SecretValueUpdatedActivityLogEntryText.svelte';
	import ServiceMaintenanceActivityLogEntryText from '../activity/list/texts/ServiceMaintenanceActivityLogEntryText.svelte';
	import TeamEnvironmentUpdatedActivityLogEntryText from '../activity/list/texts/TeamEnvironmentUpdatedActivityLogEntryText.svelte';
	import TeamMemberAddedActivityLogEntryText from '../activity/list/texts/TeamMemberAddedActivityLogEntryText.svelte';
	import TeamMemberRemovedActivityLogEntryText from '../activity/list/texts/TeamMemberRemovedActivityLogEntryText.svelte';
	import TeamMemberSetRoleActivityLogEntryText from '../activity/list/texts/TeamMemberSetRoleActivityLogEntryText.svelte';
	import TeamUpdatedActivityLogEntryText from '../activity/list/texts/TeamUpdatedActivityLogEntryText.svelte';
	import UnleashInstanceUpdatedActivityLogEntryText from '../activity/list/texts/UnleashInstanceUpdatedActivityLogEntryText.svelte';
	import ValkeyCreatedActivityLogEntryText from '../activity/list/texts/ValkeyCreatedActivityLogEntryText.svelte';
	import ValkeyDeletedActivityLogEntryText from '../activity/list/texts/ValkeyDeletedActivityLogEntryText.svelte';
	import ValkeyUpdatedActivityLogEntryText from '../activity/list/texts/ValkeyUpdatedActivityLogEntryText.svelte';
	import VulnerabilityUpdatedActivityLogEntryText from '../activity/list/texts/VulnerabilityUpdatedActivityLogEntryText.svelte';
	import ListItem from './ListItem.svelte';

	interface Props {
		item: ActivityLogEntryFragment;
	}

	let { item }: Props = $props();

	let data = $derived(
		fragment(
			item,
			graphql(`
				fragment ActivityLogEntryFragment on ActivityLogEntry {
					__typename
					id
					createdAt
					actor
					createdAt
					environmentName
					message
					resourceName
					resourceType
					teamSlug
					... on ApplicationDeletedActivityLogEntry {
						__typename
					}
					... on ApplicationRestartedActivityLogEntry {
						__typename
					}
					... on ApplicationScaledActivityLogEntry {
						appScaled: data {
							newSize
							direction
						}
					}
					... on ClusterAuditActivityLogEntry {
						id
						clusterAuditData: data {
							action
							resourceKind
						}
					}
					... on DeploymentActivityLogEntry {
						deploymentData: data {
							triggerURL
						}
					}
					... on JobDeletedActivityLogEntry {
						__typename
					}
					... on JobTriggeredActivityLogEntry {
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
								newValue
								oldValue
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
					... on ServiceMaintenanceActivityLogEntry {
						__typename
					}
					... on TeamEnvironmentUpdatedActivityLogEntry {
						teamEnvironmentUpdated: data {
							updatedFields {
								field
								newValue
								oldValue
							}
						}
					}
					... on TeamMemberAddedActivityLogEntry {
						teamMemberAdded: data {
							role
							userEmail
						}
					}
					... on TeamMemberRemovedActivityLogEntry {
						teamMemberRemoved: data {
							userEmail
						}
					}
					... on TeamMemberSetRoleActivityLogEntry {
						teamMemberSetRole: data {
							role
							userEmail
						}
					}
					... on TeamUpdatedActivityLogEntry {
						teamUpdated: data {
							updatedFields {
								field
								newValue
								oldValue
							}
						}
					}
					... on UnleashInstanceUpdatedActivityLogEntry {
						unleashInstanceUpdated: data {
							allowedTeamSlug
							revokedTeamSlug
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
								newValue
								oldValue
							}
						}
					}
					... on VulnerabilityUpdatedActivityLogEntry {
						__typename
						vulnerabilityUpdated: data {
							identifier
							package
							severity
							previousSuppression {
								reason
								state
							}
							newSuppression {
								reason
								state
							}
						}
					}
				}
			`)
		)
	);

	const Icon = $derived(icons[$data.__typename] || RocketIcon);

	function textComponent(typename: string): Component<{ data: unknown }> | null {
		switch (typename) {
			case 'ApplicationDeletedActivityLogEntry':
				return ApplicationDeletedActivityLogEntryText as Component<{ data: unknown }>;
			case 'ApplicationRestartedActivityLogEntry':
				return ApplicationRestartedActivityLogEntryText as Component<{ data: unknown }>;
			case 'ApplicationScaledActivityLogEntry':
				return ApplicationScaledActivityLogEntryText as Component<{ data: unknown }>;
			case 'ClusterAuditActivityLogEntry':
				return ClusterAuditActivityLogEntryText as Component<{ data: unknown }>;
			case 'DeploymentActivityLogEntry':
				return DeploymentActivityLogEntryText as Component<{ data: unknown }>;
			case 'JobDeletedActivityLogEntry':
				return JobDeletedActivityLogEntryText as Component<{ data: unknown }>;
			case 'JobTriggeredActivityLogEntry':
				return JobTriggeredActivityLogEntryText as Component<{ data: unknown }>;
			case 'OpenSearchCreatedActivityLogEntry':
				return OpenSearchCreatedActivityLogEntryText as Component<{ data: unknown }>;
			case 'OpenSearchDeletedActivityLogEntry':
				return OpenSearchDeletedActivityLogEntryText as Component<{ data: unknown }>;
			case 'OpenSearchUpdatedActivityLogEntry':
				return OpenSearchUpdatedActivityLogEntryText as Component<{ data: unknown }>;
			case 'RepositoryAddedActivityLogEntry':
				return RepositoryAddedActivityLogEntryText as Component<{ data: unknown }>;
			case 'RepositoryRemovedActivityLogEntry':
				return RepositoryRemovedActivityLogEntryText as Component<{ data: unknown }>;
			case 'SecretCreatedActivityLogEntry':
				return SecretCreatedActivityLogEntryText as Component<{ data: unknown }>;
			case 'SecretDeletedActivityLogEntry':
				return SecretDeletedActivityLogEntryText as Component<{ data: unknown }>;
			case 'SecretValueAddedActivityLogEntry':
				return SecretValueAddedActivityLogEntryText as Component<{ data: unknown }>;
			case 'SecretValueRemovedActivityLogEntry':
				return SecretValueRemovedActivityLogEntryText as Component<{ data: unknown }>;
			case 'SecretValueUpdatedActivityLogEntry':
				return SecretValueUpdatedActivityLogEntryText as Component<{ data: unknown }>;
			case 'ServiceMaintenanceActivityLogEntry':
				return ServiceMaintenanceActivityLogEntryText as Component<{ data: unknown }>;
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
			case 'ValkeyCreatedActivityLogEntry':
				return ValkeyCreatedActivityLogEntryText as Component<{ data: unknown }>;
			case 'ValkeyDeletedActivityLogEntry':
				return ValkeyDeletedActivityLogEntryText as Component<{ data: unknown }>;
			case 'ValkeyUpdatedActivityLogEntry':
				return ValkeyUpdatedActivityLogEntryText as Component<{ data: unknown }>;
			case 'VulnerabilityUpdatedActivityLogEntry':
				return VulnerabilityUpdatedActivityLogEntryText as Component<{ data: unknown }>;
			default:
				return null;
		}
	}

	const TextComponent = $derived(textComponent($data.__typename));
</script>

<ListItem>
	<div style="display: flex; gap: 0.5rem;">
		<div
			class={activityIconClassFromEntry(
				$data,
				$data.__typename === 'ClusterAuditActivityLogEntry'
					? $data.clusterAuditData?.action
					: undefined
			)}
		>
			<Icon size="1.25em" width="1.25em" height="1.25em" />
		</div>

		<div>
			{#if TextComponent}
				<TextComponent data={$data} />
			{:else}
				<BodyShort size="small" spacing>
					{$data.message}
					{#if $data.environmentName}
						in <Tag size="small" variant={envTagVariant($data.environmentName)}>
							{$data.environmentName}
						</Tag>.
					{/if}
				</BodyShort>
				<BodyShort size="small" style="color: var(--ax-text-subtle)">
					<Time time={$data.createdAt} distance={true} />
					by {$data.actor}
				</BodyShort>
			{/if}
		</div>
	</div>
</ListItem>
