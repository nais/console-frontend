<script lang="ts">
	import {
		fragment,
		graphql,
		type WorkloadActivityLogFragment,
		type WorkloadActivityLogFragment$data
	} from '$houdini';
	import { Heading } from '@nais/ds-svelte-community';
	import { CaretUpDownIcon, PlayIcon, RocketIcon } from '@nais/ds-svelte-community/icons';
	import type { Component } from 'svelte';
	import ApplicationScaledActivityLogEntryText from './texts/ApplicationScaledActivityLogEntryText.svelte';
	import DefaultText from './texts/DefaultText.svelte';
	import DeploymentActivityLogEntryText from './texts/DeploymentActivityLogEntryText.svelte';

	interface Props {
		workload: WorkloadActivityLogFragment;
	}

	let { workload }: Props = $props();

	let data = $derived(
		fragment(
			workload,
			graphql(`
				fragment WorkloadActivityLogFragment on Workload {
					activityLog(first: 10) {
						nodes {
							id
							actor
							message
							createdAt
							__typename
							... on DeploymentActivityLogEntry {
								deploymentData: data {
									triggerURL
								}
							}
							... on ApplicationScaledActivityLogEntry {
								appScaled: data {
									newSize
									direction
								}
							}
						}
					}
				}
			`)
		)
	);

	type Kind =
		| WorkloadActivityLogFragment$data['activityLog']['nodes'][number]['__typename']
		| 'JobTriggeredActivityLogEntry';
	const icons: { [key in Kind]?: Component } = {
		DeploymentActivityLogEntry: RocketIcon,
		ApplicationScaledActivityLogEntry: CaretUpDownIcon,
		JobTriggeredActivityLogEntry: PlayIcon
	};

	function textComponent(kind: Kind): Component<{ data: unknown }> {
		switch (kind) {
			case 'DeploymentActivityLogEntry':
				return DeploymentActivityLogEntryText as Component<{ data: unknown }>;
			case 'ApplicationScaledActivityLogEntry':
				return ApplicationScaledActivityLogEntryText as Component<{ data: unknown }>;
			default:
				return DefaultText as Component<{ data: unknown }>;
		}
	}
</script>

<div class="wrapper">
	<Heading level="3" size="small">Activity</Heading>
	{#each $data.activityLog.nodes as entry (entry.id)}
		{@const Icon = icons[entry.__typename] || RocketIcon}
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
