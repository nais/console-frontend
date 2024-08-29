<script lang="ts">
	import type { Utilization } from '$houdini';
	import { PendingValue, fragment, graphql } from '$houdini';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import { cpuUtilization, memoryUtilization } from '$lib/utils/resources';
	import { Skeleton } from '@nais/ds-svelte-community';

	export let app: Utilization;
	$: data = fragment(
		app,
		graphql(`
			fragment Utilization on App {
				instances @loading {
					id
				}
				resources @loading {
					requests {
						cpu
						memory
					}
				}
				utilization @loading{
					cpuUsage: usage(resourceType: CPU)
					memoryUsage: usage(resourceType: MEMORY)
				}
			}
		`)
	);
</script>

<div class="wrapper">
	<h5>Utilization</h5>
	{#if $data.resources === PendingValue}
		<Skeleton variant="text" width="100px" />
	{:else}
		{@const cpu = $data.resources.requests.cpu}
		{@const mem = $data.resources.requests.memory}
		{@const cpuUsage = $data.utilization.cpuUsage}
		{@const memUsage = $data.utilization.memoryUsage}
		{@const ic = $data.instances.length}
		{@const cpuUtil = cpuUtilization(cpu, ic, cpuUsage)}
		{@const memUtil = memoryUtilization(mem, ic, memUsage)}

		<CpuIcon />
		{cpuUtil}% of {cpu} CPU<br />
		<MemoryIcon />
		{memUtil}% of {mem} memory
	{/if}
</div>

<style>
	.wrapper {
		color: var(--a-text-subtle);
		width: 50%;
	}
</style>
