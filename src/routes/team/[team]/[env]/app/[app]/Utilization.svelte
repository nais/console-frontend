<script lang="ts">
	import type { Utilization } from '$houdini';
	import { PendingValue, fragment, graphql } from '$houdini';
	import { Skeleton, Tooltip } from '@nais/ds-svelte-community';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import { cpuUtilization } from '$lib/utils/resources';

	export let app: Utilization;
	$: data = fragment(
		app,
		graphql(`
			fragment Utilization on App {
				instances @loading{
					id
				}
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
	{#if $data.resources === PendingValue}
		<Skeleton variant="text" width="100px" />
	{:else }
	{ @const cpu = $data.resources.requests.cpu}
	{ @const mem = $data.resources.requests.memory}
	{ @const cpuUsage = $data.resources.cpuUsage}
	{ @const memUsage = $data.resources.memoryUsage}
	{ @const ic = $data.instances.length }
	{ @const cpuUtil = cpuUtilization(cpu, ic, cpuUsage) }

	
		<Tooltip content="utilization">
			<CpuIcon /> {cpuUtil}% of </Tooltip
		>
		<Tooltip content="Maximum replicas">
			max: {mem}
		</Tooltip>
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
</style>
