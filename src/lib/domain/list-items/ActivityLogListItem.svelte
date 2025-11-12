<script lang="ts">
	import { fragment, graphql, type ActivityLogEntryFragment } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort, Tag, Tooltip } from '@nais/ds-svelte-community';
	import { RocketIcon } from '@nais/ds-svelte-community/icons';
	import type { Component } from 'svelte';
	import { activityIconClassFromEntry, icons } from '../activity/activity-log-icons';
	import { activityTooltip } from '../activity/activity-log-tooltip';
	import '../activity/activity-log.css';
	import ApplicationDeletedActivityLogEntryText from '../activity/shared/texts/ApplicationDeletedActivityLogEntryText.svelte';
	import ApplicationRestartedActivityLogEntryText from '../activity/shared/texts/ApplicationRestartedActivityLogEntryText.svelte';
	import ApplicationScaledActivityLogEntryText from '../activity/shared/texts/ApplicationScaledActivityLogEntryText.svelte';
	import ClusterAuditActivityLogEntryText from '../activity/shared/texts/ClusterAuditActivityLogEntryText.svelte';
	import DeploymentActivityLogEntryText from '../activity/shared/texts/DeploymentActivityLogEntryText.svelte';
	import JobDeletedActivityLogEntryText from '../activity/shared/texts/JobDeletedActivityLogEntryText.svelte';
	import JobTriggeredActivityLogEntryText from '../activity/shared/texts/JobTriggeredActivityLogEntryText.svelte';
	import OpenSearchCreatedActivityLogEntryText from '../activity/shared/texts/OpenSearchCreatedActivityLogEntryText.svelte';
	import OpenSearchDeletedActivityLogEntryText from '../activity/shared/texts/OpenSearchDeletedActivityLogEntryText.svelte';
	import OpenSearchUpdatedActivityLogEntryText from '../activity/shared/texts/OpenSearchUpdatedActivityLogEntryText.svelte';
	import RepositoryAddedActivityLogEntryText from '../activity/shared/texts/RepositoryAddedActivityLogEntryText.svelte';
	import RepositoryRemovedActivityLogEntryText from '../activity/shared/texts/RepositoryRemovedActivityLogEntryText.svelte';
	import SecretCreatedActivityLogEntryText from '../activity/shared/texts/SecretCreatedActivityLogEntryText.svelte';
	import SecretDeletedActivityLogEntryText from '../activity/shared/texts/SecretDeletedActivityLogEntryText.svelte';
	import SecretValueAddedActivityLogEntryText from '../activity/shared/texts/SecretValueAddedActivityLogEntryText.svelte';
	import SecretValueRemovedActivityLogEntryText from '../activity/shared/texts/SecretValueRemovedActivityLogEntryText.svelte';
	import SecretValueUpdatedActivityLogEntryText from '../activity/shared/texts/SecretValueUpdatedActivityLogEntryText.svelte';
	import ServiceMaintenanceActivityLogEntryText from '../activity/shared/texts/ServiceMaintenanceActivityLogEntryText.svelte';
	import TeamEnvironmentUpdatedActivityLogEntryText from '../activity/shared/texts/TeamEnvironmentUpdatedActivityLogEntryText.svelte';
	import TeamMemberAddedActivityLogEntryText from '../activity/shared/texts/TeamMemberAddedActivityLogEntryText.svelte';
	import TeamMemberRemovedActivityLogEntryText from '../activity/shared/texts/TeamMemberRemovedActivityLogEntryText.svelte';
	import TeamMemberSetRoleActivityLogEntryText from '../activity/shared/texts/TeamMemberSetRoleActivityLogEntryText.svelte';
	import TeamUpdatedActivityLogEntryText from '../activity/shared/texts/TeamUpdatedActivityLogEntryText.svelte';
	import UnleashInstanceUpdatedActivityLogEntryText from '../activity/shared/texts/UnleashInstanceUpdatedActivityLogEntryText.svelte';
	import ValkeyCreatedActivityLogEntryText from '../activity/shared/texts/ValkeyCreatedActivityLogEntryText.svelte';
	import ValkeyDeletedActivityLogEntryText from '../activity/shared/texts/ValkeyDeletedActivityLogEntryText.svelte';
	import ValkeyUpdatedActivityLogEntryText from '../activity/shared/texts/ValkeyUpdatedActivityLogEntryText.svelte';
	import VulnerabilityUpdatedActivityLogEntryText from '../activity/shared/texts/VulnerabilityUpdatedActivityLogEntryText.svelte';

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
		<div class={activityIconClassFromEntry($data)}>
			<Tooltip content={activityTooltip($data.__typename)}>
				<Icon size="1em" width="1em" height="1em" />
			</Tooltip>
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
