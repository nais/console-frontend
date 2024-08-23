<script lang="ts">
	import type { Utilization } from '$houdini';
	import { PendingValue, fragment, graphql } from '$houdini';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import { Skeleton, Tooltip } from '@nais/ds-svelte-community';

	export let app: Utilization;
	$: data = fragment(
		app,
		graphql(`
			fragment Utilization on App {
				resources @loading{
					requests {
						cpu
						memory
					}
					cpuUsage: usage(resourceType: CPU)
					memoryUsage: usage(resourceType: MEMORY)
				}
			}
		`)
	);
</script>

<div class="wrapper">
	{#if $data.resour !== PendingValue && autoscaling.disabled}
		Scaling based on custom metrics
	{:else if autoscaling !== PendingValue}
		<Tooltip content="Minimum replicas">
			min: {autoscaling.min}</Tooltip
		>
		<Tooltip content="Maximum replicas">
			max: {autoscaling.max}
		</Tooltip>
		{#if autoscaling.cpuThreshold > 0}
			<Tooltip content="CPU threshold"
				><div class="cpu">
					<div style="margin-top: 4px;"><CpuIcon /></div>
					{autoscaling.cpuThreshold}%
				</div>
			</Tooltip>
		{/if}
	{:else}
		<Skeleton variant="text" width="100px" />
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: 1rem;
		color: var(--a-text-subtle);
	}
	.cpu {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
