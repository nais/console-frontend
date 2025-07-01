<script lang="ts">
	import {
		fragment,
		graphql,
		type TeamActivityLogFragment,
		type TeamActivityLogFragment$data
	} from '$houdini';
	import DefaultText from '$lib/components/workloadActivity/DefaultText.svelte';
	import { Heading } from '@nais/ds-svelte-community';
	import {
		MinusCircleIcon,
		PersonIcon,
		PersonPencilIcon,
		PlusCircleIcon
	} from '@nais/ds-svelte-community/icons';
	import type { Component } from 'svelte';
	import TeamMemberAddedActivityLogEntryText from './TeamMemberAddedActivityLogEntryText.svelte';
	import TeamMemberRemovedActivityLogEntryText from './TeamMemberRemovedActivityLogEntryText.svelte';
	import TeamMemberSetRoleActivityLogEntryText from './TeamMemberSetRoleActivityLogEntryText.svelte';

	interface Props {
		team: TeamActivityLogFragment;
	}

	let { team }: Props = $props();

	let data = $derived(
		fragment(
			team,
			graphql(`
				fragment TeamActivityLogFragment on Team {
					activityLog(
						first: 10
						filter: {
							activityTypes: [TEAM_MEMBER_ADDED, TEAM_MEMBER_REMOVED, TEAM_MEMBER_SET_ROLE]
						}
					) {
						nodes {
							__typename
							id
							message
							createdAt
							actor
							... on TeamMemberAddedActivityLogEntry {
								addedData: data {
									role
									userEmail
									userID
								}
							}
							... on TeamMemberRemovedActivityLogEntry {
								removedData: data {
									userEmail
									userID
								}
							}
							... on TeamMemberSetRoleActivityLogEntry {
								setRoleData: data {
									role
									userEmail
									userID
								}
							}
						}
					}
				}
			`)
		)
	);

	type Kind = TeamActivityLogFragment$data['activityLog']['nodes'][number]['__typename'];

	const icons: { [key in Kind]?: Component } = {
		TeamMemberAddedActivityLogEntry: PlusCircleIcon,
		TeamMemberRemovedActivityLogEntry: MinusCircleIcon,
		TeamMemberSetRoleActivityLogEntry: PersonPencilIcon
	};

	function textComponent(kind: Kind): Component<{ data: unknown }> {
		switch (kind) {
			case 'TeamMemberAddedActivityLogEntry':
				return TeamMemberAddedActivityLogEntryText as Component<{ data: unknown }>;
			case 'TeamMemberRemovedActivityLogEntry':
				return TeamMemberRemovedActivityLogEntryText as Component<{ data: unknown }>;
			case 'TeamMemberSetRoleActivityLogEntry':
				return TeamMemberSetRoleActivityLogEntryText as Component<{ data: unknown }>;
			default:
				return DefaultText as Component<{ data: unknown }>;
		}
	}
</script>

<div class="wrapper">
	<Heading level="3" size="small">Activity</Heading>
	{#each $data.activityLog.nodes as entry (entry.id)}
		{@const Icon = icons[entry.__typename] || PersonIcon}
		{@const TextComponent = textComponent(entry.__typename)}

		<div class="item">
			<div class="icon">
				<Icon width="75%" height="75%" />
			</div>
			<div class="content"><TextComponent data={entry} /></div>
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
	}
	.item {
		display: flex;
		position: relative;
		padding-bottom: 0.75rem;

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
			padding: 0 0 0 1rem;
		}

		&:not(:last-child)::before {
			background: var(--ax-border-neutral-subtleA);
			content: '';
			height: 100%;
			left: 14px;
			position: absolute;
			top: 20px;
			width: 2px;
			z-index: 0;
		}
	}
</style>
