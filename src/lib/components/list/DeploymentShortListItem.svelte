<script lang="ts">
	import { fragment, graphql, type DeploymentItemFragment } from '$houdini';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';

	interface Props {
		deployment: DeploymentItemFragment;
	}

	let { deployment }: Props = $props();

	let data = $derived(
		fragment(
			deployment,
			graphql(`
				fragment DeploymentItemFragment on Deployment {
					createdAt
					environmentName
					deployerUsername
					triggerUrl
					resources {
						nodes {
							id
							kind
							name
						}
					}
					statuses {
						nodes {
							state
						}
					}
				}
			`)
		)
	);
</script>

<div class="deployment">
	<div>
		<BodyShort size="small" spacing>
			{$data.deployerUsername ? $data.deployerUsername : 'Something'} deployed {#each $data.resources.nodes as r, i (r.id)}
				<strong>{r.name}</strong>
				(<code>{r.kind}</code>){#if i < $data.resources.nodes.length - 2},&nbsp;
				{:else if i === $data.resources.nodes.length - 2}
					&nbsp;and&nbsp;
				{/if}
			{/each}
			<time time={$data.createdAt} distance /> to
			<Tag size="small" variant={envTagVariant($data.environmentName)}>{$data.environmentName}</Tag>
		</BodyShort>
	</div>
	<div class="status">
		{#if $data.statuses.nodes.length === 0}
			<DeploymentStatus status="UNKNOWN" />
		{:else}<DeploymentStatus status={$data.statuses.nodes[0].state} />{/if}
	</div>
</div>

<style>
	code {
		font-size: 14px;
	}
	.deployment {
		display: grid;
		gap: var(--ax-space-24, --a-spacing-6);
		grid-template-columns: 1fr 100px;
	}
	.status {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--ax-space-4, --a-spacing-1);
		font-size: 16px;
	}
</style>
