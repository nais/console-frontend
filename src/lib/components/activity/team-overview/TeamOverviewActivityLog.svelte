<script lang="ts">
	import { ActivityLogActivityType, graphql, type ActivityLogFilter } from '$houdini';
	import { Button, Heading, Loader } from '@nais/ds-svelte-community';
	import { RocketIcon } from '@nais/ds-svelte-community/icons';
	import type { Component } from 'svelte';

	import { activityIconClassFromEntry, icons } from '../activity-log-icons';
	import '../activity-log.css';
	import ApplicationRestartedActivityLogEntryText from './texts/ApplicationRestartedActivityLogEntryText.svelte';
	import ApplicationScaledActivityLogEntryText from './texts/ApplicationScaledActivityLogEntryText.svelte';
	import ClusterAuditActivityLogEntryText from './texts/ClusterAuditActivityLogEntryText.svelte';
	import DefaultText from './texts/DefaultText.svelte';
	import DeploymentActivityLogEntryText from './texts/DeploymentActivityLogEntryText.svelte';
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
	import TeamMemberAddedActivityLogEntryText from './texts/TeamMemberAddedActivityLogEntryText.svelte';
	import TeamMemberRemovedActivityLogEntryText from './texts/TeamMemberRemovedActivityLogEntryText.svelte';
	import TeamMemberSetRoleActivityLogEntryText from './texts/TeamMemberSetRoleActivityLogEntryText.svelte';
	import ValkeyCreatedActivityLogEntryText from './texts/ValkeyCreatedActivityLogEntryText.svelte';
	import ValkeyDeletedActivityLogEntryText from './texts/ValkeyDeletedActivityLogEntryText.svelte';
	import ValkeyUpdatedActivityLogEntryText from './texts/ValkeyUpdatedActivityLogEntryText.svelte';

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
			ActivityLogActivityType.DEPLOYMENT,
			ActivityLogActivityType.JOB_DELETED,
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
		query TeamOverviewActivityLog(
			$teamSlug: Slug!
			$first: Int!
			$after: Cursor
			$filter: ActivityLogFilter
		) {
			team(slug: $teamSlug) {
				activityLog(first: $first, after: $after, filter: $filter) @paginate(mode: Infinite) {
					pageInfo {
						hasNextPage
						endCursor
					}
					edges {
						node {
							id
							actor
							message
							createdAt
							resourceName
							resourceType
							environmentName
							teamSlug
							... on ApplicationScaledActivityLogEntry {
								__typename

								appScaled: data {
									newSize
									direction
								}
							}
							... on ClusterAuditActivityLogEntry {
								__typename

								clusterAuditData: data {
									action
									resourceKind
								}
							}
							... on DeploymentActivityLogEntry {
								__typename

								deploymentData: data {
									triggerURL
								}
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
								__typename

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
								__typename

								secretValueAdded: data {
									valueName
								}
							}
							... on SecretValueRemovedActivityLogEntry {
								__typename

								secretValueRemoved: data {
									valueName
								}
							}
							... on SecretValueUpdatedActivityLogEntry {
								__typename

								secretValueUpdated: data {
									valueName
								}
							}
							... on TeamMemberAddedActivityLogEntry {
								__typename

								teamMemberAdded: data {
									role
									userEmail
								}
							}
							... on TeamMemberRemovedActivityLogEntry {
								__typename

								teamMemberRemoved: data {
									userEmail
								}
							}
							... on TeamMemberSetRoleActivityLogEntry {
								__typename

								teamMemberSetRole: data {
									role
									userEmail
								}
							}
							... on ValkeyUpdatedActivityLogEntry {
								__typename

								valkeyUpdated: data {
									updatedFields {
										field
										newValue
										oldValue
									}
								}
							}
							... on ValkeyCreatedActivityLogEntry {
								__typename
							}
							... on ValkeyDeletedActivityLogEntry {
								__typename
							}
						}
					}
				}
			}
		}
	`);

	$effect.pre(() => {
		activityLogQuery.fetch({ variables: { teamSlug, first: 10, filter } });
	});

	type Kind = string;

	function textComponent(kind: Kind): Component<{ data: unknown }> {
		switch (kind) {
			case 'ApplicationDeletedActivityLogEntry':
			case 'JobDeletedActivityLogEntry':
				return ResourceDeletedActivityLogEntryText as Component<{ data: unknown }>;
			case 'ApplicationRestartedActivityLogEntry':
				return ApplicationRestartedActivityLogEntryText as Component<{ data: unknown }>;
			case 'ApplicationScaledActivityLogEntry':
				return ApplicationScaledActivityLogEntryText as Component<{ data: unknown }>;
			case 'ClusterAuditActivityLogEntry':
				return ClusterAuditActivityLogEntryText as Component<{ data: unknown }>;
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

	async function loadMore() {
		await activityLogQuery.loadNextPage({ first: 10 });
	}
</script>

<div class="wrapper">
	<Heading level="2" size="small" spacing
		><a href="/team/{teamSlug}/activity-log">Activity log</a></Heading
	>
	{#if $activityLogQuery.fetching || !$activityLogQuery.data}
		<div style="display: flex; justify-content: center; align-items: center; min-height: 500px;">
			<Loader size="3xlarge" />
		</div>
	{:else}
		{#each $activityLogQuery.data?.team?.activityLog.edges || [] as { node: entry } (entry.id)}
			{@const Icon = icons[entry.__typename] || RocketIcon}
			{@const TextComponent = textComponent(entry.__typename)}
			<div class="item">
				<div class={activityIconClassFromEntry(entry)}>
					<Icon size="1.25em" width="1.25em" height="1.25em" />
				</div>
				<div class="content">
					<TextComponent data={entry} />
				</div>
			</div>
		{/each}

		{#if !$activityLogQuery.fetching && ($activityLogQuery.data?.team?.activityLog.edges || []).length === 0}
			<p class="empty">No recent activity found.</p>
		{/if}

		{#if $activityLogQuery.data?.team?.activityLog.pageInfo.hasNextPage}
			<div class="load-more">
				<Button variant="tertiary" size="small" onclick={loadMore}>Load more acitivities</Button>
			</div>
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
		padding: var(--ax-space-4) 0;
		gap: var(--ax-space-12);
		align-items: flex-start;
	}

	/* vertical timeline line */
	.item::before {
		content: '';
		position: absolute;
		left: 20px;
		top: 48px;
		bottom: -1px;
		width: 1px;
		background: var(--ax-border-neutral-strong);
		z-index: 0;
	}
	.item:last-child::before {
		display: none;
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

	.load-more {
		display: flex;
		justify-content: center;
		padding: var(--ax-space-4) 0;
	}
</style>
