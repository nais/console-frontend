<script lang="ts">
	import type { Utilization } from '$houdini';
	import { fragment, graphql, PendingValue } from '$houdini';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import { cpuUtilization, memoryUtilization } from '$lib/utils/resources';
	import prettyBytes from 'pretty-bytes';

	export let app: Utilization;
	$: data = fragment(
		app,
		graphql(`
			fragment Utilization on App {
				utilization @loading {
					cpuUsage: used(resourceType: CPU)
					cpuRequests: requested(resourceType: CPU)
					memoryUsage: used(resourceType: MEMORY)
					memoryRequests: requested(resourceType: MEMORY)
				}
			}
		`)
	);
</script>

<div class="wrapper">
	<h5>Utilization</h5>
	{#if $data.utilization !== PendingValue}
		{@const cpu = $data.utilization.cpuRequests}
		{@const mem = $data.utilization.memoryRequests}
		{@const cpuUsage = $data.utilization.cpuUsage}
		{@const memUsage = $data.utilization.memoryUsage}
		{@const cpuUtil = cpuUtilization(cpu, cpuUsage)}
		{@const memUtil = memoryUtilization(mem, memUsage)}

		<CpuIcon />
		{cpuUtil}% of {cpu}CPUs<br />
		<MemoryIcon />
		{memUtil}% of {prettyBytes(mem)} of memory
	{/if}
</div>

<style>
	.wrapper {
		color: var(--a-text-subtle);
		width: 50%;
	}
</style>
