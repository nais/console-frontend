<script lang="ts">
	import { fragment, graphql, type WorkloadDeploy } from '$houdini';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';
	import { RocketIcon } from '@nais/ds-svelte-community/icons';
	import IconLabel from '$lib/ui/IconLabel.svelte';

	interface Props {
		workload: WorkloadDeploy;
	}

	let { workload }: Props = $props();

	let data = $derived(
		fragment(
			workload,
			graphql(`
				fragment WorkloadDeploy on Workload {
					deployments(first: 1) {
						nodes {
							createdAt
							statuses {
								nodes {
									state
								}
							}
						}
					}
				}
			`)
		)
	);

	let deploymentInfo = $derived(
		$data.deployments.nodes.length > 0 ? $data.deployments.nodes[0] : null
	);
</script>

<div class="wrapper">
	{#if deploymentInfo}
		{#if deploymentInfo.createdAt}
			<IconLabel icon={RocketIcon} size="medium">
				{#snippet label()}
					Last deployed <Time time={deploymentInfo.createdAt} distance={true} />
				{/snippet}
			</IconLabel>
		{/if}
	{:else}
		<BodyShort>No deployment metadata found for workload.</BodyShort>
	{/if}
	<div style="display: flex; gap: var(--ax-space-8);">
		{#if deploymentInfo?.statuses && deploymentInfo.statuses.nodes && deploymentInfo.statuses.nodes.length > 0}
			{#if deploymentInfo?.statuses.nodes[0].state === 'FAILURE'}
				<Tag variant="error" size="small">Failed</Tag>
			{/if}
		{/if}
	</div>
</div>

<style>
	.wrapper {
		margin-top: -2rem;
		display: flex;
		gap: var(--ax-space-12);
		align-items: center;
	}
</style>
