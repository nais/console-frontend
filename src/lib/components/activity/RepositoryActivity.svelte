<script lang="ts">
	import {
		fragment,
		graphql,
		type RepositoryActivityLogFragment,
		type RepositoryActivityLogFragment$data
	} from '$houdini';
	import { Heading } from '@nais/ds-svelte-community';
	import { MinusCircleIcon, PersonIcon, PlusCircleIcon } from '@nais/ds-svelte-community/icons';
	import type { Component } from 'svelte';
	import DefaultText from './DefaultText.svelte';
	import RepositoryAddedActivityLogEntryText from './RepositoryAddedActivityLogEntryText.svelte';
	import RepositoryRemovedActivityLogEntryText from './RepositoryRemovedActivityLogEntryText.svelte';

	interface Props {
		team: RepositoryActivityLogFragment;
	}

	let { team }: Props = $props();

	let data = $derived(
		fragment(
			team,
			graphql(`
				fragment RepositoryActivityLogFragment on Team {
					activityLog(
						first: 10
						filter: { activityTypes: [REPOSITORY_ADDED, REPOSITORY_REMOVED] }
					) {
						nodes {
							__typename
							id
							... on RepositoryAddedActivityLogEntry {
								actor
								createdAt
								resourceName
							}
							... on RepositoryRemovedActivityLogEntry {
								actor
								createdAt
								resourceName
							}
						}
					}
				}
			`)
		)
	);

	type Kind = RepositoryActivityLogFragment$data['activityLog']['nodes'][number]['__typename'];

	const icons: { [key in Kind]?: Component } = {
		RepositoryAddedActivityLogEntry: PlusCircleIcon,
		RepositoryRemovedActivityLogEntry: MinusCircleIcon
	};

	function textComponent(kind: Kind): Component<{ data: unknown }> {
		switch (kind) {
			case 'RepositoryAddedActivityLogEntry':
				return RepositoryAddedActivityLogEntryText as Component<{ data: unknown }>;
			case 'RepositoryRemovedActivityLogEntry':
				return RepositoryRemovedActivityLogEntryText as Component<{ data: unknown }>;
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
