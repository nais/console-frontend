<script lang="ts">
	import type { Scaling } from '$houdini';
	import { fragment, graphql } from '$houdini';

	interface Props {
		app: Scaling;
	}

	let { app }: Props = $props();
	let data = $derived(
		fragment(
			app,
			graphql(`
				fragment Scaling on Application {
					resources {
						scaling {
							maxInstances
							minInstances
							strategies {
								... on CPUScalingStrategy {
									threshold
								}
								... on KafkaLagScalingStrategy {
									consumerGroup
									threshold
									topicName
								}
							}
						}
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

<div class="wrapper">
	{#if $data.resources.scaling}
		{@const scaling = $data.resources.scaling}
		{#if scaling.minInstances !== scaling.maxInstances}
			<h5>Scaling configuration</h5>
			<div class="resources">
				<div class="replicas">
					{scaling.minInstances} - {scaling.maxInstances} instances based on
					{#if scaling.strategies && scaling.strategies.length > 0}
						{#each scaling.strategies as strategy, i}
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
