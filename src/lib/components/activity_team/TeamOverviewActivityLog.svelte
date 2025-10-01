<script lang="ts">
	import { ActivityLogActivityType, graphql, type ActivityLogFilter } from '$houdini';
	import { Button, Heading, Loader } from '@nais/ds-svelte-community';
	import {
		CaretUpDownIcon,
		LayerMinusIcon,
		LayersPlusIcon,
		MinusCircleIcon,
		NotePencilIcon,
		PackageIcon,
		PersonPencilIcon,
		PlayIcon,
		PlusCircleIcon,
		RocketIcon
	} from '@nais/ds-svelte-community/icons';
	import type { Component } from 'svelte';

	import GitHubIcon from '$lib/icons/GitHubIcon.svelte';
	import OpenSearchIcon from '$lib/icons/OpenSearchIcon.svelte';
	import ValkeyIcon from '$lib/icons/ValkeyIcon.svelte';
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
							__typename
							actor
							message
							createdAt
							resourceName
							resourceType
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
							... on DeploymentActivityLogEntry {
								deploymentData: data {
									triggerURL
								}
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
								id
							}
							... on RepositoryRemovedActivityLogEntry {
								id
							}
							... on SecretCreatedActivityLogEntry {
								id
							}
							... on SecretDeletedActivityLogEntry {
								id
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
							... on ValkeyCreatedActivityLogEntry {
								__typename
							}
							... on ValkeyDeletedActivityLogEntry {
								__typename
							}
							... on ValkeyUpdatedActivityLogEntry {
								valkeyUpdated: data {
									updatedFields {
										field
										newValue
										oldValue
									}
								}
							}
						}
					}
				}
			}
		}
	`);

	$effect.pre(() => {
		activityLogQuery.fetch({ variables: { teamSlug, first: 100, filter } });
	});

	type Kind = string;

	function textComponent(kind: Kind): Component<{ data: unknown }> {
		switch (kind) {
			case 'ApplicationDeletedActivityLogEntry':
				return ResourceDeletedActivityLogEntryText as Component<{ data: unknown }>;
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

	const icons: { [key: string]: Component } = {
		ApplicationDeletedActivityLogEntry: PackageIcon,
		ApplicationScaledActivityLogEntry: CaretUpDownIcon,
		ClusterAuditActivityLogEntry: NotePencilIcon,
		DeploymentActivityLogEntry: RocketIcon,
		JobTriggeredActivityLogEntry: PlayIcon,
		OpenSearchCreatedActivityLogEntry: OpenSearchIcon,
		OpenSearchDeletedActivityLogEntry: OpenSearchIcon,
		OpenSearchUpdatedActivityLogEntry: OpenSearchIcon,
		RepositoryAddedActivityLogEntry: GitHubIcon,
		RepositoryRemovedActivityLogEntry: GitHubIcon,
		SecretCreatedActivityLogEntry: PlusCircleIcon,
		SecretDeletedActivityLogEntry: MinusCircleIcon,
		SecretValueAddedActivityLogEntry: LayersPlusIcon,
		SecretValueRemovedActivityLogEntry: LayerMinusIcon,
		SecretValueUpdatedActivityLogEntry: NotePencilIcon,
		TeamMemberAddedActivityLogEntry: PlusCircleIcon,
		TeamMemberRemovedActivityLogEntry: MinusCircleIcon,
		TeamMemberSetRoleActivityLogEntry: PersonPencilIcon,
		ValkeyCreatedActivityLogEntry: ValkeyIcon,
		ValkeyDeletedActivityLogEntry: ValkeyIcon,
		ValkeyUpdatedActivityLogEntry: ValkeyIcon
	};

	// ---- Styling helper: returnerer hele class-stringen for ikondiven
	function iconClass(entry: { __typename: string; appScaled?: { direction?: string } }): string {
		const t = entry.__typename as string;

		// Scale
		if (t === 'ApplicationScaledActivityLogEntry') {
			const dir = entry.appScaled?.direction;
			if (dir === 'up') return 'icon scale-up';
			if (dir === 'down') return 'icon scale-down';
			return 'icon scale-neutral';
		}

		// Cluster audit
		if (t === 'ClusterAuditActivityLogEntry') return 'icon audit';

		// Generiske typer
		if (t.includes('Added') || t.includes('Created')) return 'icon added';
		if (t.includes('Removed') || t.includes('Deleted')) return 'icon deleted';
		if (t.includes('Updated') || t.includes('SetRole')) return 'icon updated';
		if (t.includes('Deployment') || t.includes('Restarted')) return 'icon deployment';
		if (t.includes('Maintenance')) return 'icon maintenance';

		return 'icon neutral';
	}
</script>

<div class="wrapper">
	<Heading level="3" size="small">Activity log</Heading>
	{#if $activityLogQuery.fetching || !$activityLogQuery.data}
		<div style="display: flex; justify-content: center; align-items: center; min-height: 500px;">
			<Loader size="3xlarge" />
		</div>
	{:else}
		{#each $activityLogQuery.data?.team?.activityLog.edges || [] as { node: entry } (entry.id)}
			{@const Icon = icons[entry.__typename] || RocketIcon}
			{@const TextComponent = textComponent(entry.__typename)}
			<div class="item">
				<div class={iconClass(entry)}>
					<Icon width="75%" height="75%" />
				</div>
				<div class="content">
					<!-- TODO: remove-->
					{#if !['ApplicationDeletedActivityLogEntry', 'ApplicationScaledActivityLogEntry', 'OpenSearchCreatedActivityLogEntry', 'OpenSearchDeletedActivityLogEntry', 'OpenSearchUpdatedActivityLogEntry', 'RepositoryAddedActivityLogEntry', 'SecretValueAddedActivityLogEntry', 'SecretValueRemovedActivityLogEntry', 'ValkeyDeletedActivityLogEntry', 'ValkeyCreatedActivityLogEntry', 'ValkeyUpdatedActivityLogEntry', 'DeploymentActivityLogEntry'].includes(entry.__typename)}
						{entry.__typename}
					{/if}
					<TextComponent data={entry} />
				</div>
			</div>
		{/each}

		{#if !$activityLogQuery.fetching && ($activityLogQuery.data?.team?.activityLog.edges || []).length === 0}
			<p class="empty">No recent activity found.</p>
		{/if}

		{#if $activityLogQuery.data?.team?.activityLog.pageInfo.hasNextPage}
			<div class="load-more">
				<Button variant="tertiary" size="small" onclick={loadMore}>Load more activity</Button>
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
		border-bottom: 1px solid var(--ax-border-subtle);
		gap: var(--ax-space-12); /* mer luft mellom ikon og tekst */
		align-items: flex-start;
	}

	.item:last-child {
		border-bottom: none;
	}

	/* vertikal “timeline” */
	.item::before {
		content: '';
		position: absolute;
		left: 20px;
		top: 48px;
		bottom: -1px;
		width: 1px;
		background: var(--ax-border-subtle);
		z-index: 0;
	}

	.item:last-child::before {
		display: none;
	}

	/* Base for ikon */
	.icon {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		flex-shrink: 0;
		border: 2px solid var(--ax-bg-default);
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.05),
			0 2px 6px rgba(0, 0, 0, 0.08);
		color: white;
		background: linear-gradient(145deg, var(--ax-bg-default), var(--ax-bg-raised)); /* fallback */
		transition:
			transform 0.15s ease-in-out,
			box-shadow 0.15s ease-in-out;
	}

	.icon:hover {
		transform: scale(1.05);
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.08),
			0 4px 10px rgba(0, 0, 0, 0.12);
	}

	/* Varianter */
	/* Scale */
	.icon.scale-up {
		background: linear-gradient(145deg, #27ae60, #1e874b); /* grønn */
	}
	.icon.scale-down {
		background: linear-gradient(145deg, #e74c3c, #c0392b); /* rød */
	}
	.icon.scale-neutral {
		background: linear-gradient(145deg, #95a5a6, #7f8c8d); /* grå */
	}

	/* Cluster audit */
	.icon.audit {
		background: linear-gradient(145deg, #16a085, #0e7668); /* teal */
	}

	/* Andre hendelser */
	.icon.added {
		background: linear-gradient(145deg, #3bb273, #2d995f);
	}
	.icon.deleted {
		background: linear-gradient(145deg, #e15241, #c0392b);
	}
	.icon.updated {
		background: linear-gradient(145deg, #3498db, #2c80b4);
	}
	.icon.deployment {
		background: linear-gradient(145deg, #8e44ad, #6d3390);
	}
	.icon.maintenance {
		background: linear-gradient(145deg, #e67e22, #ca6b16);
	}
	.icon.neutral {
		background: linear-gradient(145deg, var(--ax-bg-default), var(--ax-bg-raised));
		color: var(--ax-text-neutral-strong);
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
