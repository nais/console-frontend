<script lang="ts">
	import type { AppUtilization } from '$houdini';
	import { fragment, graphql } from '$houdini';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import { cpuUtilization, memoryUtilization } from '$lib/utils/resources';
	import prettyBytes from 'pretty-bytes';

	export let app: AppUtilization;
	$: data = fragment(
		app,
		graphql(`
			fragment AppUtilization on Application {
				utilization {
					cpuUsage: current(resourceType: CPU)
					cpuRequests: requested(resourceType: CPU)
					memoryUsage: current(resourceType: MEMORY)
					memoryRequests: requested(resourceType: MEMORY)
				}
			}
		`)
	);
	console.log(data);
</script>

<div class="wrapper">
	<h5>Utilization</h5>
	{#if $data.utilization}
		{@const cpu = $data.utilization.cpuRequests}
		{@const mem = $data.utilization.memoryRequests}
		{@const cpuUsage = $data.utilization.cpuUsage}
		{@const memUsage = $data.utilization.memoryUsage}
		{@const cpuUtil = cpuUtilization(cpu, cpuUsage)}
		{@const memUtil = memoryUtilization(mem, memUsage)}
		<CpuIcon />
		{cpuUtil}% of {$data.utilization.cpuRequests}CPUs<br />
		<MemoryIcon />
		{memUtil}% of {prettyBytes($data.utilization.memoryRequests)} of memory
	{/if}
</div>

<style>
	.wrapper {
		color: var(--a-text-subtle);
		width: 50%;
	}
</style>
