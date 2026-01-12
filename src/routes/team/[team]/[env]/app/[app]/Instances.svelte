<script lang="ts">
	import { type App$result, type AppInstances$result } from '$houdini';
	import AppInstanceListItem from '$lib/domain/list-items/AppInstanceListItem.svelte';
	import List from '$lib/ui/List.svelte';
	import { Alert, BodyShort, Heading } from '@nais/ds-svelte-community';
	import prettyBytes from 'pretty-bytes';

	interface Props {
		app: App$result | null;
		instances: AppInstances$result | null;
	}

	let { app, instances }: Props = $props();

	const appInstances = $derived(
		instances?.team.environment.application.instances.edges.map((edge) => edge.node) ?? []
	);

	const cpu_usage = $derived(app?.team.environment.application.utilization.current_cpu ?? 0);

	const memory_usage = $derived(app?.team.environment.application.utilization.current_memory ?? 0);

	const usage_cpu_percent = $derived(
		app?.team.environment.application.utilization.requested_cpu
			? (cpu_usage / app?.team.environment.application.utilization.requested_cpu) * 100
			: 0
	);

	const usage_memory_percent = $derived(
		app?.team.environment.application.utilization.requested_memory
			? (memory_usage / app?.team.environment.application.utilization.requested_memory) * 100
			: 0
	);

	const cpuReqRecommendation = $derived(
		app?.team.environment.application.utilization.recommendations.cpuRequestCores ?? 0
	);

	const cpuReq = $derived(app?.team.environment.application.resources.requests.cpu ?? 0);

	const memReqRecommendation = $derived(
		app?.team.environment.application.utilization.recommendations.memoryRequestBytes ?? 0
	);

	const memReq = $derived(app?.team.environment.application.resources.requests.memory ?? 0);

	const renameStrategy = (type: string) => {
		if (type === 'CPUScalingStrategy') {
			return 'CPU usage';
		} else if (type === 'KafkaLagScalingStrategy') {
			return 'Kafka Lag';
		} else {
			return 'Unknown';
		}
	};

	function isIn50PercentRange(n: number, target: number): boolean {
		const lowerBound = target * 0.5; // 50% less than the target
		const upperBound = target * 1.5; // 50% more than the target
		return n >= lowerBound && n <= upperBound;
	}
</script>

{#if app}
	<div>
		{#if !isIn50PercentRange(cpuReq, cpuReqRecommendation) || !isIn50PercentRange(memReq, memReqRecommendation)}
			<Alert variant="info" size="small" style="margin-bottom: var(--ax-space-8);">
				CPU and/or memory requests differ by more than 50% from the recommended values. To optimize
				resource usage and cost, consider adjusting the requested resources. Refer to the
				application's <a
					href="/team/{app.team.environment.application.team.slug}/{app.team.environment.application
						.teamEnvironment.environment.name}/app/{app.team.environment.application
						.name}/utilization">utilization</a
				> page for more details.
			</Alert>
		{/if}

		<Heading as="h4" size="small">Resources:</Heading>
		<ul class="resource-list">
			<li>
				CPU:
				<ul>
					<li>
						<div class="resource-list-item">
							<div>Request:</div>
							<div class="data">
								<code>
									{#if app.team.environment.application.resources.requests.cpu}
										{app.team.environment.application.resources.requests.cpu?.toFixed(3)} CPUs
									{:else if app.team.environment.application.utilization.requested_cpu}
										{app.team.environment.application.utilization.requested_cpu?.toFixed(3)} CPUs (default)
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
									{#if app.team.environment.application.resources.limits.cpu}
										{app.team.environment.application.resources.limits.cpu.toFixed(3)} CPUs
									{:else if app.team.environment.application.utilization.limit_cpu}
										{app.team.environment.application.utilization.limit_cpu.toFixed(3)} CPUs (default)
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
									{#if app.team.environment.application.resources.requests.memory !== null}
										{prettyBytes(app.team.environment.application.resources.requests.memory, {
											locale: 'en',
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
											binary: true
										})}
									{:else}
										{prettyBytes(app.team.environment.application.utilization.requested_memory, {
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
									{#if app.team.environment.application.resources.limits.memory}
										{prettyBytes(app.team.environment.application.resources.limits.memory, {
											locale: 'en',
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
											binary: true
										})}
									{:else if app.team.environment.application.utilization.limit_memory}
										{prettyBytes(app.team.environment.application.utilization.limit_memory, {
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

	{#if app.team.environment.application.resources.scaling}
		{@const scaling = app.team.environment.application.resources.scaling}
		{#if scaling.minInstances !== scaling.maxInstances}
			<div>
				<Heading as="h4" size="small">Scaling Configuration</Heading>
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
{/if}

{#if app}
	{#if appInstances.length === 0}
		<BodyShort>No instances found</BodyShort>
	{:else if app && instances}
		<List
			title="{String(
				instances.team.environment.application.instances.pageInfo.totalCount ?? 0
			)} application instance{appInstances.length === 1 ? '' : 's'}"
		>
			{#each appInstances as instance (instance.id)}
				<AppInstanceListItem
					{instance}
					urlBase="/team/{app.team.environment.application.team.slug}/{app.team.environment
						.application.teamEnvironment.environment.name}/app/{app.team.environment.application
						.name}/logs?instance="
					utilization={app.team.environment.application.utilization}
				/>
			{/each}
		</List>
	{/if}
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
