<script lang="ts">
	import { ActivityLogActivityType, graphql, type ActivityLogFilter } from '$houdini';
	import { Heading, Loader, Tooltip } from '@nais/ds-svelte-community';
	import { RocketIcon } from '@nais/ds-svelte-community/icons';
	import type { Component } from 'svelte';

	import { icons } from '../activity-log-icons';
	import { activityTooltip } from '../activity-log-tooltip';
	import '../activity-log.css';
	import ApplicationRestartedActivityLogEntryText from '../sidebar/texts/ApplicationRestartedActivityLogEntryText.svelte';
	import ApplicationScaledActivityLogEntryText from '../sidebar/texts/ApplicationScaledActivityLogEntryText.svelte';
	import ClusterAuditActivityLogEntryText from '../sidebar/texts/ClusterAuditActivityLogEntryText.svelte';
	import CredentialsActivityLogEntryText from '../sidebar/texts/CredentialsActivityLogEntryText.svelte';
	import DefaultText from '../sidebar/texts/DefaultText.svelte';
	import DeploymentActivityLogEntryText from '../sidebar/texts/DeploymentActivityLogEntryText.svelte';
	import JobRunDeletedActivityLogEntryText from '../sidebar/texts/JobRunDeletedActivityLogEntryText.svelte';
	import OpenSearchCreatedActivityLogEntryText from '../sidebar/texts/OpenSearchCreatedActivityLogEntryText.svelte';
	import OpenSearchDeletedActivityLogEntryText from '../sidebar/texts/OpenSearchDeletedActivityLogEntryText.svelte';
	import OpenSearchUpdatedActivityLogEntryText from '../sidebar/texts/OpenSearchUpdatedActivityLogEntryText.svelte';
	import RepositoryAddedActivityLogEntryText from '../sidebar/texts/RepositoryAddedActivityLogEntryText.svelte';
	import RepositoryRemovedActivityLogEntryText from '../sidebar/texts/RepositoryRemovedActivityLogEntryText.svelte';
	import ResourceDeletedActivityLogEntryText from '../sidebar/texts/ResourceDeletedActivityLogEntryText.svelte';
	import SecretCreatedActivityLogEntryText from '../sidebar/texts/SecretCreatedActivityLogEntryText.svelte';
	import SecretDeletedActivityLogEntryText from '../sidebar/texts/SecretDeletedActivityLogEntryText.svelte';
	import SecretValueAddedActivityLogEntryText from '../sidebar/texts/SecretValueAddedActivityLogEntryText.svelte';
	import SecretValueRemovedActivityLogEntryText from '../sidebar/texts/SecretValueRemovedActivityLogEntryText.svelte';
	import SecretValuesViewedActivityLogEntryText from '../sidebar/texts/SecretValuesViewedActivityLogEntryText.svelte';
	import SecretValueUpdatedActivityLogEntryText from '../sidebar/texts/SecretValueUpdatedActivityLogEntryText.svelte';
	import TeamMemberAddedActivityLogEntryText from '../sidebar/texts/TeamMemberAddedActivityLogEntryText.svelte';
	import TeamMemberRemovedActivityLogEntryText from '../sidebar/texts/TeamMemberRemovedActivityLogEntryText.svelte';
	import TeamMemberSetRoleActivityLogEntryText from '../sidebar/texts/TeamMemberSetRoleActivityLogEntryText.svelte';
	import ValkeyCreatedActivityLogEntryText from '../sidebar/texts/ValkeyCreatedActivityLogEntryText.svelte';
	import ValkeyDeletedActivityLogEntryText from '../sidebar/texts/ValkeyDeletedActivityLogEntryText.svelte';
	import ValkeyUpdatedActivityLogEntryText from '../sidebar/texts/ValkeyUpdatedActivityLogEntryText.svelte';

	interface Props {
		teamSlug: string;
	}
	let { teamSlug }: Props = $props();

	const filter: ActivityLogFilter = {
		activityTypes: [
			ActivityLogActivityType.APPLICATION_DELETED,
			ActivityLogActivityType.APPLICATION_RESTARTED,
			ActivityLogActivityType.APPLICATION_SCALED,
			ActivityLogActivityType.CLUSTER_AUDIT,
			ActivityLogActivityType.CREDENTIALS_CREATE,
			ActivityLogActivityType.DEPLOYMENT,
			ActivityLogActivityType.JOB_DELETED,
			ActivityLogActivityType.JOB_RUN_DELETED,
			ActivityLogActivityType.JOB_TRIGGERED,
			ActivityLogActivityType.OPENSEARCH_CREATED,
			ActivityLogActivityType.OPENSEARCH_DELETED,
			ActivityLogActivityType.OPENSEARCH_UPDATED,
			ActivityLogActivityType.OPENSEARCH_MAINTENANCE_STARTED,
			ActivityLogActivityType.RECONCILER_CONFIGURED,
			ActivityLogActivityType.RECONCILER_DISABLED,
			ActivityLogActivityType.RECONCILER_ENABLED,
			ActivityLogActivityType.REPOSITORY_ADDED,
			ActivityLogActivityType.REPOSITORY_REMOVED,
			ActivityLogActivityType.SECRET_CREATED,
			ActivityLogActivityType.SECRET_DELETED,
			ActivityLogActivityType.SECRET_VALUE_ADDED,
			ActivityLogActivityType.SECRET_VALUE_REMOVED,
			ActivityLogActivityType.SECRET_VALUE_UPDATED,
			ActivityLogActivityType.SECRET_VALUES_VIEWED,
			ActivityLogActivityType.TEAM_CONFIRM_DELETE_KEY,
			ActivityLogActivityType.TEAM_CREATED,
			ActivityLogActivityType.TEAM_CREATE_DELETE_KEY,
			ActivityLogActivityType.TEAM_DEPLOY_KEY_UPDATED,
			ActivityLogActivityType.TEAM_ENVIRONMENT_UPDATED,
			ActivityLogActivityType.TEAM_MEMBER_ADDED,
			ActivityLogActivityType.TEAM_MEMBER_REMOVED,
			ActivityLogActivityType.TEAM_MEMBER_SET_ROLE,
			ActivityLogActivityType.TEAM_UPDATED,
			ActivityLogActivityType.VALKEY_CREATED,
			ActivityLogActivityType.VALKEY_DELETED,
			ActivityLogActivityType.VALKEY_UPDATED,
			ActivityLogActivityType.VALKEY_MAINTENANCE_STARTED,
			ActivityLogActivityType.UNLEASH_INSTANCE_CREATED,
			ActivityLogActivityType.UNLEASH_INSTANCE_UPDATED,
			ActivityLogActivityType.VULNERABILITY_UPDATED
		]
	};

	const activityLogQuery = graphql(`
		query TeamOverviewActivityLog($teamSlug: Slug!, $filter: ActivityLogFilter) {
			team(slug: $teamSlug) {
				activityLog(first: 10, filter: $filter) {
					edges {
						node {
							id
							actor
							message
							createdAt
							resourceName
							resourceType
							__typename
							environmentName
							teamSlug
							... on ApplicationScaledActivityLogEntry {
								appScaled: data {
									newSize
									direction
								}
							}
							... on ClusterAuditActivityLogEntry {
								clusterAuditData: data {
									action
									resourceKind
								}
							}
							... on CredentialsActivityLogEntry {
								credentialsData: data {
									serviceType
									instanceName
									permission
									ttl
								}
							}
							... on DeploymentActivityLogEntry {
								deploymentData: data {
									triggerURL
								}
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
							... on SecretValueAddedActivityLogEntry {
								secretValueAddedData: data {
									valueName
								}
							}
							... on SecretValueRemovedActivityLogEntry {
								secretValueRemovedData: data {
									valueName
								}
							}
							... on SecretValueUpdatedActivityLogEntry {
								secretValueUpdatedData: data {
									valueName
								}
							}
							... on SecretValuesViewedActivityLogEntry {
								secretValuesViewed: data {
									reason
								}
							}
							... on TeamMemberAddedActivityLogEntry {
								addedData: data {
									role
									userEmail
								}
							}
							... on TeamMemberRemovedActivityLogEntry {
								removedData: data {
									userEmail
								}
							}
							... on TeamMemberSetRoleActivityLogEntry {
								setRoleData: data {
									role
									userEmail
								}
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
							... on JobRunDeletedActivityLogEntry {
								jobRunDeletedData: data {
									runName
								}
							}
						}
					}
				}
			}
		}
	`);

	$effect(() => {
		activityLogQuery.fetch({ variables: { teamSlug, filter } });
	});

	type Kind = string;

	function textComponent(kind: Kind): Component<{ data: unknown }> {
		switch (kind) {
			case 'ApplicationDeletedActivityLogEntry':
			case 'JobDeletedActivityLogEntry':
				return ResourceDeletedActivityLogEntryText as Component<{ data: unknown }>;
			case 'JobRunDeletedActivityLogEntry':
				return JobRunDeletedActivityLogEntryText as Component<{ data: unknown }>;
			case 'ApplicationRestartedActivityLogEntry':
				return ApplicationRestartedActivityLogEntryText as Component<{ data: unknown }>;
			case 'ApplicationScaledActivityLogEntry':
				return ApplicationScaledActivityLogEntryText as Component<{ data: unknown }>;
			case 'ClusterAuditActivityLogEntry':
				return ClusterAuditActivityLogEntryText as Component<{ data: unknown }>;
			case 'CredentialsActivityLogEntry':
				return CredentialsActivityLogEntryText as Component<{ data: unknown }>;
			case 'DeploymentActivityLogEntry':
				return DeploymentActivityLogEntryText as Component<{ data: unknown }>;
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
			case 'TeamMemberAddedActivityLogEntry':
				return TeamMemberAddedActivityLogEntryText as Component<{ data: unknown }>;
			case 'TeamMemberRemovedActivityLogEntry':
				return TeamMemberRemovedActivityLogEntryText as Component<{ data: unknown }>;
			case 'TeamMemberSetRoleActivityLogEntry':
				return TeamMemberSetRoleActivityLogEntryText as Component<{ data: unknown }>;
			case 'ValkeyCreatedActivityLogEntry':
				return ValkeyCreatedActivityLogEntryText as Component<{ data: unknown }>;
			case 'ValkeyDeletedActivityLogEntry':
				return ValkeyDeletedActivityLogEntryText as Component<{ data: unknown }>;
			case 'ValkeyUpdatedActivityLogEntry':
				return ValkeyUpdatedActivityLogEntryText as Component<{ data: unknown }>;
			default:
				return DefaultText as Component<{ data: unknown }>;
		}
	}
</script>

<div class="wrapper">
	<Heading as="h2" size="small" spacing
		><a href="/team/{teamSlug}/activity-log">Activity log</a></Heading
	>
	{#if $activityLogQuery.fetching || !$activityLogQuery.data}
		<div style="display: flex; justify-content: center; align-items: center; min-height: 500px;">
			<Loader size="3xlarge" />
		</div>
	{:else}
		{#each $activityLogQuery.data?.team?.activityLog.edges || [] as { node: entry }, i (entry.id)}
			{@const Icon = icons[entry.__typename] || RocketIcon}
			{@const TextComponent = textComponent(entry.__typename)}
			{@const isLast = i === ($activityLogQuery.data?.team?.activityLog.edges?.length ?? 0) - 1}
			<div class="item" class:last-item={isLast}>
				<div class="activity-icon">
					<Tooltip content={activityTooltip(entry.__typename)}>
						<Icon size="1em" width="1em" height="1em" />
					</Tooltip>
				</div>
				<div class="content">
					<TextComponent data={entry} />
				</div>
			</div>
		{/each}

		{#if !$activityLogQuery.fetching && ($activityLogQuery.data?.team?.activityLog.edges || []).length === 0}
			<p class="empty">No recent activity found.</p>
		{/if}
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
	}

	.item {
		display: flex;
		position: relative;
		padding-bottom: var(--ax-space-4);
		gap: var(--ax-space-12);
		align-items: flex-start;
	}

	/* vertical timeline line */
	.item:not(.last-item)::before {
		content: '';
		position: absolute;
		left: 16px; /* centers under 32px icon */
		top: 20px;
		bottom: 0;
		width: 2px;
		background: var(--ax-border-neutral-subtleA);
		z-index: 0;
	}

	/* Add background to icon to block the line */
	.item :global(.activity-icon) {
		background: var(--ax-bg-default);
		border-radius: 50%;
	}

	.content {
		flex: 1;
		min-width: 0;
		padding-top: var(--ax-space-1);
	}

	.empty {
		text-align: center;
		color: var(--ax-text-subtle);
		padding: var(--ax-space-8) var(--ax-space-4);
		font-style: italic;
	}
</style>
