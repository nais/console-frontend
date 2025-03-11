<script lang="ts">
	import type { AppInstances } from '$houdini';
	import { fragment, graphql } from '$houdini';
	import AppInstanceListItem from '$lib/components/list/AppInstanceListItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	interface Props {
		app: AppInstances;
	}

	let { app }: Props = $props();
	let data = $derived(
		fragment(
			app,
			graphql(`
				fragment AppInstances on Application {
					team {
						slug
					}
					name
					teamEnvironment {
						environment {
							name
						}
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
					instances {
						edges {
							node {
								id
								name
								restarts
								status {
									state
									message
								}
								created
							}
						}
					}
					resources {
						requests {
							cpu
							memory
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

	const instances = $derived($data.instances.edges.map((edge) => edge.node));
</script>

{#if $data.resources.scaling}
	{@const scaling = $data.resources.scaling}
	{#if scaling.minInstances !== scaling.maxInstances}
		<div>
			<strong>Scaling configuration:</strong>
			{scaling.minInstances} - {scaling.maxInstances} instances based on
			{#if scaling.strategies && scaling.strategies.length > 0}
				{#each scaling.strategies as strategy, i (strategy)}
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
	{/if}
{/if}
{#if instances.length === 0}
	<BodyShort>No instances found</BodyShort>
{:else}
	<List title="{instances.length} application instance{instances.length === 1 ? '' : 's'}">
		{#each instances as instance (instance.id)}
			<AppInstanceListItem
				{instance}
				urlBase="/team/{$data.team.slug}/{$data.teamEnvironment.environment
					.name}/app/{$data.name}/logs?name="
			/>
		{/each}
	</List>
{/if}
