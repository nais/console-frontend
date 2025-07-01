<script lang="ts">
	import {
		fragment,
		graphql,
		type SecretActivityLogFragment,
		type SecretActivityLogFragment$data
	} from '$houdini';
	import { Heading } from '@nais/ds-svelte-community';
	import {
		LayerMinusIcon,
		LayersPlusIcon,
		MinusCircleIcon,
		NotePencilIcon,
		PlusCircleIcon,
		QuestionmarkIcon
	} from '@nais/ds-svelte-community/icons';
	import type { Component } from 'svelte';
	import DefaultText from './texts/DefaultText.svelte';
	import SecretCreatedActivityLogEntryText from './texts/SecretCreatedActivityLogEntryText.svelte';
	import SecretDeletedActivityLogEntry from './texts/SecretDeletedActivityLogEntry.svelte';
	import SecretValueAddedActivityLogEntryText from './texts/SecretValueAddedActivityLogEntryText.svelte';
	import SecretValueRemovedActivityLogEntryText from './texts/SecretValueRemovedActivityLogEntryText.svelte';
	import SecretValueUpdatedActivityLogEntryText from './texts/SecretValueUpdatedActivityLogEntryText.svelte';

	interface Props {
		team: SecretActivityLogFragment;
	}

	let { team }: Props = $props();

	let data = $derived(
		fragment(
			team,
			graphql(`
				fragment SecretActivityLogFragment on Team {
					activityLog(
						first: 10
						filter: {
							activityTypes: [
								SECRET_CREATED
								SECRET_DELETED
								SECRET_VALUE_ADDED
								SECRET_VALUE_UPDATED
								SECRET_VALUE_REMOVED
							]
						}
					) {
						nodes {
							__typename
							id
							actor
							createdAt
							message
							resourceType
							resourceName
							... on SecretCreatedActivityLogEntry {
								id
							}
							... on SecretDeletedActivityLogEntry {
								id
							}
							... on SecretValueAddedActivityLogEntry {
								secretValueAddedData: data {
									valueName
								}
							}
							... on SecretValueUpdatedActivityLogEntry {
								secretValueUpdatedData: data {
									valueName
								}
							}
							... on SecretValueRemovedActivityLogEntry {
								secretValueRemoved: data {
									valueName
								}
							}
						}
					}
				}
			`)
		)
	);

	type Kind = SecretActivityLogFragment$data['activityLog']['nodes'][number]['__typename'];

	const icons: { [key in Kind]?: Component } = {
		SecretValueAddedActivityLogEntry: LayersPlusIcon,
		SecretValueRemovedActivityLogEntry: LayerMinusIcon,
		SecretValueUpdatedActivityLogEntry: NotePencilIcon,
		SecretCreatedActivityLogEntry: PlusCircleIcon,
		SecretDeletedActivityLogEntry: MinusCircleIcon
	};

	function textComponent(kind: Kind): Component<{ data: unknown }> {
		switch (kind) {
			case 'SecretValueAddedActivityLogEntry':
				return SecretValueAddedActivityLogEntryText as Component<{ data: unknown }>;
			case 'SecretValueUpdatedActivityLogEntry':
				return SecretValueUpdatedActivityLogEntryText as Component<{ data: unknown }>;
			case 'SecretValueRemovedActivityLogEntry':
				return SecretValueRemovedActivityLogEntryText as Component<{ data: unknown }>;
			case 'SecretCreatedActivityLogEntry':
				return SecretCreatedActivityLogEntryText as Component<{ data: unknown }>;
			case 'SecretDeletedActivityLogEntry':
				return SecretDeletedActivityLogEntry as Component<{ data: unknown }>;
			default:
				return DefaultText as Component<{ data: unknown }>;
		}
	}
</script>

<div class="wrapper">
	<Heading level="3" size="small">Activity</Heading>
	{#each $data.activityLog.nodes as entry (entry.id)}
		{@const Icon = icons[entry.__typename] || QuestionmarkIcon}
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
