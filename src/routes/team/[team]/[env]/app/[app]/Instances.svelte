<script lang="ts">
	import type { AppInstances } from '$houdini';
	import { fragment, graphql } from '$houdini';
	import AppInstanceListItem from '$lib/components/list/AppInstanceListItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import { BodyShort, Heading } from '@nais/ds-svelte-community';
	import prettyBytes from 'pretty-bytes';

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
						requests {
							cpu
							memory
						}
						limits {
							cpu
							memory
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
								memory: instanceUtilization(resourceType: MEMORY) {
									current
								}
								cpu: instanceUtilization(resourceType: CPU) {
									current
								}
							}
						}
					}
					utilization {
						requested_cpu: requested(resourceType: CPU)
						requested_memory: requested(resourceType: MEMORY)
						limit_cpu: limit(resourceType: CPU)
						limit_memory: limit(resourceType: MEMORY)
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

<div>
	<Heading level="4" size="small">Resources:</Heading>
	<ul class="resource-list">
		<li>
			Requests:
			<ul>
				<li>
					<div class="resource-list-item">
						<div>CPU:</div>
						<div class="data">
							<code>
								{#if $data.resources.requests.cpu}
									{$data.resources.requests.cpu?.toFixed(2)} CPUs
								{:else if $data.utilization.requested_cpu}
									{$data.utilization.requested_cpu?.toFixed(2)} CPUs (default)
								{:else}
									Not set
								{/if}
							</code>
						</div>
					</div>
				</li>

				<li>
					<div class="resource-list-item">
						<div>Memory:</div>
						<div class="data">
							<code>
								{#if $data.resources.requests.memory !== null}
									{prettyBytes($data.resources.requests.memory, {
										locale: 'en',
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
										binary: true
									})}
								{:else}
									{prettyBytes($data.utilization.requested_memory, {
										locale: 'en',
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
										binary: true
									})} (default)
								{/if}
							</code>
						</div>
					</div>
				</li>
			</ul>
		</li>
		<li>
			Limits:
			<ul>
				<li>
					<div class="resource-list-item">
						<div>CPU:</div>
						<div class="data">
							<code>
								{#if $data.resources.limits.cpu}
									{$data.resources.limits.cpu.toFixed(2)} CPUs
								{:else if $data.utilization.limit_cpu}
									{$data.utilization.limit_cpu.toFixed(2)} CPUs (default)
								{:else}
									Not set
								{/if}
							</code>
						</div>
					</div>
				</li>

				<li>
					<div class="resource-list-item">
						<div>Memory:</div>
						<div class="data">
							<code>
								{#if $data.resources.limits.memory}
									{prettyBytes($data.resources.limits.memory, {
										locale: 'en',
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
										binary: true
									})}
								{:else if $data.utilization.limit_memory}
									{prettyBytes($data.utilization.limit_memory, {
										locale: 'en',
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
										binary: true
									})} (default)
								{:else}
									Not set
								{/if}
							</code>
						</div>
					</div>
				</li>
			</ul>
		</li>
	</ul>
</div>

{#if $data.resources.scaling}
	{@const scaling = $data.resources.scaling}
	{#if scaling.minInstances !== scaling.maxInstances}
		<div>
			<Heading level="4" size="small">Scaling Configuration</Heading>
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
					.name}/app/{$data.name}/logs?instance="
				utilization={$data.utilization}
			/>
		{/each}
	</List>
{/if}

<style>
	ul {
		list-style-type: none;
		padding: 0;
		margin: 0;
	}

	li ul {
		margin-left: 1rem;
	}

	.resource-list {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	.resource-list-item {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	.data {
		text-align: right;
	}
	code {
		font-size: 1rem;
	}
</style>
