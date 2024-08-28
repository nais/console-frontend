<script lang="ts">
	import type { Scaling, Scaling$data } from '$houdini';
	import { PendingValue, fragment, graphql } from '$houdini';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import { Skeleton, Tooltip, HelpText } from '@nais/ds-svelte-community';

	export let app: Scaling;
	$: data = fragment(
		app,
		graphql(`
			fragment Scaling on App {
				resources @loading {
					scaling {
						max
						min
						strategies {
							threshold
							... on CPUScalingStrategy {
								threshold
							}
							... on KafkaLagScalingStrategy {
								consumerGroup
								topic
							}
						}
					}
				}
			}
		`)
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

<div class="wrapper">
	{#if $data.resources && $data.resources !== PendingValue}
		{@const resources = $data.resources}
		{#if resources.scaling.min !== resources.scaling.max}
			<div class="resources">
				<div class="replicas">
					<Tooltip content="Number of instances">
						{resources.scaling.min} - {resources.scaling.max}
						instances based on
					</Tooltip>
					{#if resources.scaling.strategies && resources.scaling.strategies.length > 0}
						{#each resources.scaling.strategies as strategy}
							<b>{renameStrategy(strategy.__typename)}</b>
							<HelpText title="scaling parameters">
								{#each Object.keys(strategy) as key}
									{#if key !== '__typename'}
										{key}: {strategy[key]}<br />
									{/if}
								{/each}
							</HelpText>
						{/each}
					{:else}
					<b>CPU usage</b>
						<HelpText title="scaling parameters">
							threshold: 50%
						</HelpText>
					{/if}
				</div>
			</div>
		{/if}
	{:else}
		<Skeleton variant="text" width="100px" />
	{/if}
</div>

<style>
	.resources {
		display: flex;
		flex-direction: column;
		color: var(--a-text-subtle);
	}
	.wrapper {
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: 1rem;
		color: var(--a-text-subtle);
	}
	.replicas {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.2rem;
	}
</style>
