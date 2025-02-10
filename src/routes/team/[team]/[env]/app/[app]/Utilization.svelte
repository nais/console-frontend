<script lang="ts">
	import type { AppUtilization } from '$houdini';
	import { fragment, graphql } from '$houdini';
	import IconWithText from '$lib/components/IconWithText.svelte';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import { cpuUtilization, memoryUtilization } from '$lib/utils/resources';
	import prettyBytes from 'pretty-bytes';

	interface Props {
		app: AppUtilization;
	}

	let { app }: Props = $props();
	let data = $derived(
		fragment(
			app,
			graphql(`
				fragment AppUtilization on Application {
					name
					team {
						slug
					}
					environment {
						name
					}
					utilization {
						cpuUsage: current(resourceType: CPU)
						cpuRequests: requested(resourceType: CPU)
						memoryUsage: current(resourceType: MEMORY)
						memoryRequests: requested(resourceType: MEMORY)
					}
				}
			`)
		)
	);
</script>

<div class="wrapper">
	{#if $data.utilization}
		{@const cpu = $data.utilization.cpuRequests}
		{@const mem = $data.utilization.memoryRequests}
		{@const cpuUsage = $data.utilization.cpuUsage}
		{@const memUsage = $data.utilization.memoryUsage}
		{@const cpuUtil = cpuUtilization(cpu, cpuUsage)}
		{@const memUtil = memoryUtilization(mem, memUsage)}
		<div>
			<IconWithText
				icon={CpuIcon}
				text="{cpuUtil}% of {$data.utilization.cpuRequests.toLocaleString('en-GB', {
					maximumFractionDigits: 2
				})}CPUs"
				size="medium"
			/>
		</div>
		<div style="margin-bottom: var(--a-spacing-1)">
			<IconWithText
				icon={MemoryIcon}
				text="{memUtil}% of {prettyBytes($data.utilization.memoryRequests)} of memory"
				size="medium"
			/>
		</div>
		<div style="margin-top: var(--a-spacing-2)">
			<a href="/team/{$data.team.slug}/{$data.environment.name}/app/{$data.name}/utilization">
				View details
			</a>
		</div>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-2);
	}
</style>
