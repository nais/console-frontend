<script lang="ts">
	import type { Scaling } from '$houdini';
	import { PendingValue, fragment, graphql } from '$houdini';
	import { Skeleton } from '@nais/ds-svelte-community';

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

	$: console.log($data.resources);
</script>

<div class="wrapper">
	{#if $data.resources && $data.resources !== PendingValue}
		{@const resources = $data.resources}
		{#if resources.scaling.min !== resources.scaling.max}
			<h5>Scaling configuration</h5>
			<div class="resources">
				<div class="replicas">
					{resources.scaling.min} - {resources.scaling.max} instances based on
					{#if resources.scaling.strategies && resources.scaling.strategies.length > 0}
						{#each resources.scaling.strategies as strategy, i}
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
	{:else}
		<Skeleton variant="text" width="100px" />
	{/if}
</div>

<style>
	.resources {
		color: var(--a-text-subtle);
	}
	.wrapper {
		gap: 1rem;
		color: var(--a-text-subtle);
		width: 50%;
	}
</style>
