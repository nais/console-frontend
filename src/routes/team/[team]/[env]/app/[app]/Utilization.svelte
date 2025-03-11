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
					teamEnvironment {
						environment {
							name
						}
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
	<div class="wrapper">
		<Heading level="3" size="small">Utilization</Heading>
		<BodyShort>
			<CpuIcon class="text-aligned-icon" />
			{cpuUtilization($data.utilization.cpuRequests, $data.utilization.cpuUsage)}% of {$data.utilization.cpuRequests.toLocaleString(
				'en-GB',
				{
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				}
			)} CPUs
		</BodyShort>
		<BodyShort>
			<FileIcon class="text-aligned-icon" />
			{(
				memoryUtilization($data.utilization.memoryRequests, $data.utilization.memoryUsage) * 100
			).toFixed(0)}% of {prettyBytes($data.utilization.memoryRequests, {
				locale: 'en',
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			})}
		</BodyShort>
		<Link
			href="/team/{$data.team.slug}/{$data.teamEnvironment.environment
				.name}/app/{$data.name}/utilization"
		>
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
