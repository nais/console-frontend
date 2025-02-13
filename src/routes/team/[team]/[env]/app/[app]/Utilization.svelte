<script lang="ts">
	import type { AppUtilization } from '$houdini';
	import { fragment, graphql } from '$houdini';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import { cpuUtilization, memoryUtilization } from '$lib/utils/resources';
	import { BodyShort, Heading, Link } from '@nais/ds-svelte-community';
	import { FileIcon } from '@nais/ds-svelte-community/icons';
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

{#if $data.utilization}
	{@const cpu = $data.utilization.cpuRequests}
	{@const mem = $data.utilization.memoryRequests}
	{@const cpuUsage = $data.utilization.cpuUsage}
	{@const memUsage = $data.utilization.memoryUsage}
	{@const cpuUtil = cpuUtilization(cpu, cpuUsage)}
	{@const memUtil = memoryUtilization(mem, memUsage)}
	<div class="wrapper">
		<Heading level="3" size="small">Utilization</Heading>
		<BodyShort>
			<CpuIcon class="text-aligned-icon" />
			{cpuUtil}% of {$data.utilization.cpuRequests.toLocaleString('en-GB', {
				maximumFractionDigits: 2
			})}CPUs
		</BodyShort>
		<BodyShort>
			<FileIcon class="text-aligned-icon" />
			{memUtil}% of {prettyBytes($data.utilization.memoryRequests)} of memory
		</BodyShort>
		<Link href="/team/{$data.team.slug}/{$data.environment.name}/app/{$data.name}/utilization">
			View details
		</Link>
	</div>
{/if}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-1);
		align-items: start;
	}
</style>
