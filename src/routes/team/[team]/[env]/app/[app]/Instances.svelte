<script lang="ts">
	import type { AppInstances } from '$houdini';
	import { fragment, graphql } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Detail, Tooltip } from '@nais/ds-svelte-community';
	import {
		CheckmarkCircleFillIcon,
		QuestionmarkIcon,
		XMarkOctagonFillIcon
	} from '@nais/ds-svelte-community/icons';

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
{#if $data.instances.edges.length === 0}
	<div>No instances found</div>
{:else}
	{@const instances = $data.instances.edges.map((edge) => edge.node)}
	<div class="list">
		<div class="header">
			<div class="count">
				<BodyShort size="small" style="font-weight: bold;">
					{$data.instances.edges.length} application instance{$data.instances.edges.length > 1
						? 's'
						: ''}
				</BodyShort>
			</div>
		</div>

		{#each instances as instance (instance.id)}
			<div class="list-item">
				<div class="run-link-wrapper">
					<div style="height: 23.98px; display: flex; align-items: center; line-height: 0">
						{#if instance.status.state === 'RUNNING'}
							<Tooltip content="Instance is running">
								<CheckmarkCircleFillIcon size="xsmall" style="color: var(--a-icon-success)" />
							</Tooltip>
						{:else if instance.status.state === 'FAILING'}
							<Tooltip content="Instance is failing">
								<XMarkOctagonFillIcon style="color: var(--a-icon-danger)" />
							</Tooltip>
						{:else}
							<Tooltip content="Application instance status is unknown">
								<QuestionmarkIcon />
							</Tooltip>
						{/if}
					</div>
					<div class="log-link">
						<a
							href="/team/{$data.team.slug}/{$data.environment
								.name}/app/{$data.name}/logs?name={instance.name}"
						>
							{instance.name}
						</a>
						<Detail>
							Created <Time time={instance.created} distance={true} />
						</Detail>
					</div>
				</div>
				<div class="info">
					<Detail>
						{instance.restarts + ' restart' + (instance.restarts > 1 ? 's' : '')}
					</Detail>
					<Detail>{instance.status.state}: {instance.status.message}</Detail>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.list {
		border: 1px solid var(--a-border-default);
		border-radius: 4px;

		.header {
			background-color: var(--active-color);
			border-radius: 4px 4px 0 0;
			border-bottom: 1px solid var(--a-border-default);
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 8px 12px;
		}
		.count {
			font-weight: bold;
		}
		.list-item {
			.run-link-wrapper {
				display: flex;
				gap: 0.3rem;
			}
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 8px 12px;
			&:not(:last-of-type) {
				border-bottom: 1px solid var(--a-border-default);
			}

			&:hover {
				background-color: var(--a-surface-subtle);
			}

			.log-link {
				:global(a) {
					font-weight: var(--a-font-weight-bold);
					&:not(:active) {
						color: var(--a-text-defualt);
					}
					text-decoration: none;
					&:hover {
						text-decoration: underline;
					}
				}
			}
		}
		.info {
			display: flex;
			align-items: flex-end;
			gap: 4px;
			flex-direction: column;
		}
	}
</style>
