<script lang="ts">
	import type { AppUtilization } from '$houdini';
	import { fragment, graphql } from '$houdini';
	import IconWithText from '$lib/components/IconWithText.svelte';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import { cpuUtilization, memoryUtilization } from '$lib/utils/resources';
	import { Heading } from '@nais/ds-svelte-community';
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
					resources {
						scaling {
							maxInstances
							minInstances
							strategies {
								__typename
								... on KafkaLagScalingStrategy {
									consumerGroup
									threshold
									topicName
								}
								... on CPUScalingStrategy {
									threshold
								}
							}
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

	const renameStrategy = (type: string) => {
		if (type === 'CPUScalingStrategy') {
			return 'CPU usage';
		} else if (type === 'KafkaLagScalingStrategy') {
			return 'Kafka Lag';
		} else {
			return 'Unknown';
		}
	};
</script>

<Heading level="3" size="small" spacing>Utilization</Heading>
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
		{#if $data.resources.scaling}
			{@const scaling = $data.resources.scaling}
			{#if scaling.minInstances !== scaling.maxInstances}
				<Heading level="4" size="xsmall">Scaling configuration</Heading>
				<div class="resources">
					<div>
						{scaling.minInstances} - {scaling.maxInstances} instances based on
						{#if scaling.strategies && scaling.strategies.length > 0}
							{#each scaling.strategies as strategy, i (strategy.__typename + i)}
								{#if i > 0}
									<br />and{/if}
								<b>{renameStrategy(strategy.__typename)}</b>
								{#if strategy.__typename === 'KafkaLagScalingStrategy'}
									(threshold: {strategy.threshold})
								{:else}
									(threshold: {strategy.threshold}%)
								{/if}
							{/each}
						{:else}
							<b>CPU usage</b> (threshold: 50%)
						{/if}
					</div>
				</div>
			{/if}
		{/if}
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
		color: var(--a-text-subtle);
	}
	.resources {
		color: var(--a-text-subtle);
	}
</style>
