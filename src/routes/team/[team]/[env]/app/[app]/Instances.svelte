<script lang="ts">
	import type { AppInstances } from '$houdini';
	import { fragment, graphql } from '$houdini';
	import AppInstanceListItem from '$lib/components/list/AppInstanceListItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import { Alert, BodyShort, Heading } from '@nais/ds-svelte-community';
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

	const instances = $derived($data.instances.edges.map((edge) => edge.node));

	let cpu_usage = $derived(
		instances.map((instance) => instance.cpu.current).reduce((a, b) => a + b, 0)
	);

	let memory_usage = $derived(
		instances.map((instance) => instance.memory.current).reduce((a, b) => a + b, 0)
	);

	let usage_cpu_percent = $derived(
		$data.resources.requests.cpu !== null && $data.resources.requests.cpu !== undefined
			? (cpu_usage / ($data.resources.requests.cpu * instances.length)) * 100
			: 0
	);

	let usage_memory_percent = $derived(
		$data.resources.requests.memory !== null && $data.resources.requests.memory !== undefined
			? (memory_usage / ($data.resources.requests.memory * instances.length)) * 100
			: 0
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

<div>
	{#if usage_cpu_percent < 50 || usage_memory_percent < 50}
		<Alert variant="info" size="small" style="margin-bottom: var(--ax-space-8);">
			CPU and/or memory utilization is below 50%. To reduce costs, consider scaling down the
			requested resources. Refer to the applications <a
				href="/team/{$data.team.slug}/{$data.teamEnvironment.environment
					.name}/app/{$data.name}/utilization">utilization</a
			> page for more details.
		</Alert>
	{/if}

	<Heading level="4" size="small">Resources:</Heading>

	<ul class="resource-list">
		<li>
			CPU:
			<ul>
				<li>
					<div class="resource-list-item">
						<div>Request:</div>
						<div class="data">
							<code>
								{#if $data.resources.requests.cpu}
									{$data.resources.requests.cpu?.toFixed(3)} CPUs
								{:else if $data.utilization.requested_cpu}
									{$data.utilization.requested_cpu?.toFixed(3)} CPUs (default)
								{:else}
									Not set
								{/if}
							</code>
						</div>
					</div>
				</li>
				<li>
					<div class="resource-list-item">
						<div>Limit:</div>
						<div class="data">
							<code>
								{#if $data.resources.limits.cpu}
									{$data.resources.limits.cpu.toFixed(3)} CPUs
								{:else if $data.utilization.limit_cpu}
									{$data.utilization.limit_cpu.toFixed(3)} CPUs (default)
								{:else}
									Not set
								{/if}
							</code>
						</div>
					</div>
				</li>
				<li>
					<div class="resource-list-item">
						<div>Usage of request:</div>
						<div class="data">
							<code>
								{usage_cpu_percent.toFixed(2)}%
							</code>
						</div>
					</div>
				</li>
			</ul>
		</li>
		<li>
			Memory:
			<ul>
				<li>
					<div class="resource-list-item">
						<div>Request:</div>
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
				<li>
					<div class="resource-list-item">
						<div>Limit:</div>
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
				<li>
					<div class="resource-list-item">
						<div>Usage of request:</div>
						<div class="data">
							<code>{usage_memory_percent.toFixed(2)}%</code>
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
