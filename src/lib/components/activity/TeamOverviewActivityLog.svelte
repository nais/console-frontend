<script lang="ts">
	import { graphql } from '$houdini';
	import { Button, Heading, Loader } from '@nais/ds-svelte-community';
	import {
		CaretUpDownIcon,
		LayerMinusIcon,
		LayersPlusIcon,
		MinusCircleIcon,
		NotePencilIcon,
		PersonPencilIcon,
		PlayIcon,
		PlusCircleIcon,
		RocketIcon
	} from '@nais/ds-svelte-community/icons';
	import type { Component } from 'svelte';

	import ApplicationScaledActivityLogEntryText from './texts/ApplicationScaledActivityLogEntryText.svelte';
	import ClusterAuditActivityLogEntryText from './texts/ClusterAuditActivityLogEntryText.svelte';
	import DefaultText from './texts/DefaultText.svelte';
	import DeploymentActivityLogEntryText from './texts/DeploymentActivityLogEntryText.svelte';
	import RepositoryAddedActivityLogEntryText from './texts/RepositoryAddedActivityLogEntryText.svelte';
	import RepositoryRemovedActivityLogEntryText from './texts/RepositoryRemovedActivityLogEntryText.svelte';
	import SecretCreatedActivityLogEntryText from './texts/SecretCreatedActivityLogEntryText.svelte';
	import SecretDeletedActivityLogEntryText from './texts/SecretDeletedActivityLogEntryText.svelte';
	import SecretValueAddedActivityLogEntryText from './texts/SecretValueAddedActivityLogEntryText.svelte';
	import SecretValueRemovedActivityLogEntryText from './texts/SecretValueRemovedActivityLogEntryText.svelte';
	import SecretValueUpdatedActivityLogEntryText from './texts/SecretValueUpdatedActivityLogEntryText.svelte';
	import TeamMemberAddedActivityLogEntryText from './texts/TeamMemberAddedActivityLogEntryText.svelte';
	import TeamMemberRemovedActivityLogEntryText from './texts/TeamMemberRemovedActivityLogEntryText.svelte';
	import TeamMemberSetRoleActivityLogEntryText from './texts/TeamMemberSetRoleActivityLogEntryText.svelte';

	interface Props {
		teamSlug: string;
	}
	let { teamSlug }: Props = $props();

	const activityLogQuery = graphql(`
		query TeamOverviewActivityLog($teamSlug: Slug!, $first: Int!, $after: Cursor) {
			team(slug: $teamSlug) {
				activityLog(first: $first, after: $after) @paginate(mode: Infinite) {
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
						}
					}
				}
			}
		}
	`);

	$effect.pre(() => {
		activityLogQuery.fetch({ variables: { teamSlug, first: 10 } });
	});

	type Kind = string;

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
			case 'TeamMemberAddedActivityLogEntry':
				return TeamMemberAddedActivityLogEntryText as Component<{ data: unknown }>;
			case 'TeamMemberRemovedActivityLogEntry':
				return TeamMemberRemovedActivityLogEntryText as Component<{ data: unknown }>;
			case 'TeamMemberSetRoleActivityLogEntry':
				return TeamMemberSetRoleActivityLogEntryText as Component<{ data: unknown }>;
			case 'ClusterAuditActivityLogEntry':
				return ClusterAuditActivityLogEntryText as Component<{ data: unknown }>;
			default:
				return DefaultText as Component<{ data: unknown }>;
		}
	}

	async function loadMore() {
		await activityLogQuery.loadNextPage({
			first: 10
		});
	}

	const icons: { [key: string]: Component } = {
		DeploymentActivityLogEntry: RocketIcon,
		ApplicationScaledActivityLogEntry: CaretUpDownIcon,
		JobTriggeredActivityLogEntry: PlayIcon,
		RepositoryAddedActivityLogEntry: PlusCircleIcon,
		RepositoryRemovedActivityLogEntry: MinusCircleIcon,
		SecretValueAddedActivityLogEntry: LayersPlusIcon,
		SecretValueRemovedActivityLogEntry: LayerMinusIcon,
		SecretValueUpdatedActivityLogEntry: NotePencilIcon,
		SecretCreatedActivityLogEntry: PlusCircleIcon,
		SecretDeletedActivityLogEntry: MinusCircleIcon,
		TeamMemberAddedActivityLogEntry: PlusCircleIcon,
		TeamMemberRemovedActivityLogEntry: MinusCircleIcon,
		TeamMemberSetRoleActivityLogEntry: PersonPencilIcon,
		ClusterAuditActivityLogEntry: NotePencilIcon
	};
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
				<div class="icon">
					<Icon width="75%" height="75%" />
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
		padding-bottom: var(--ax-space-12);
	}

	.icon {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 32px;
		height: 32px;
		min-width: 32px;
		min-height: 32px;
		background: var(--ax-bg-raised);
		border: 1px solid var(--ax-border-neutral-subtle);
		z-index: 1;
		border-radius: 50%;
		color: var(--ax-text-neutral-strong);
	}

	.content {
		flex: 1 1 auto;
		padding: 0 0 0 var(--ax-space-12);
	}

	.empty {
		color: var(--ax-text-neutral-subtle);
		font-style: italic;
		padding: var(--ax-space-8) 0;
	}

	.load-more {
		display: flex;
		justify-content: center;
		padding-top: var(--ax-space-8);
	}

	.item:not(:last-child)::before {
		background: var(--ax-border-neutral-subtle);
		content: '';
		height: calc(100% - 16px);
		left: 15px;
		position: absolute;
		top: 24px;
		width: 2px;
		z-index: 0;
	}
</style>
