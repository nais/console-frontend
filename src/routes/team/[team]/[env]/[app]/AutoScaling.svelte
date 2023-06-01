<script lang="ts">
	import { AutoScalingStore, fragment, graphql } from '$houdini';
	import type { AutoScaling } from '$houdini';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import { Tooltip } from '@nais/ds-svelte';
	import { ArrowUp, ArrowDown } from '@nais/ds-svelte/icons';

	export let app: AutoScaling;
	$: data = fragment(
		app,
		graphql(`
			fragment AutoScaling on App {
				autoScaling {
					disabled
					cpuThreshold
					max
					min
				}
			}
		`)
	);

	$: autoscaling = $data.autoScaling;
</script>

<div class="wrapper">
	{#if autoscaling.disabled}
		based on custom metrics
	{:else}
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
