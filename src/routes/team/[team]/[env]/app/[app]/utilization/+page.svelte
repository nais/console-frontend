<script lang="ts">
	import { page } from '$app/state';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';

	import { UtilizationResourceType, type ResourceUtilizationForApp$result } from '$houdini';
	import AnnotationSeries from '$lib/chart/AnnotationSeries.svelte';
	import { docURL } from '$lib/doc';
	import {
		euroValueFormatter,
		formatKubernetesCPU,
		formatKubernetesMemory
	} from '$lib/utils/formatters';
	import { round, yearlyOverageCost } from '$lib/utils/resources';
	import { changeParams } from '$lib/utils/searchparams';
	import { visualizationColors } from '$lib/visualizationColors';
	import {
		BodyLong,
		BodyShort,
		Heading,
		Loader,
		ReadMore,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		ToggleGroup,
		ToggleGroupItem,
		Tr
	} from '@nais/ds-svelte-community';
	import { WalletFillIcon } from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
	import { AreaChart, Tooltip, type ChartAnnotations } from 'layerchart';
	import prettyBytes from 'pretty-bytes';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { ResourceUtilizationForApp } = $derived(data);

	const interval = $derived(page.url.searchParams.get('interval') ?? '7d');

	type groupedLogs = {
		timestamp: number;
		logs: ResourceUtilizationForApp$result['team']['environment']['application']['activityLog']['nodes'];
	};

	let chartWidth: number | undefined = $state(undefined);

	/**
	 * groupedActivityLog returns a grouped array of activity logs, where each group contains logs that occurred within the same 10-minute interval.
	 * @param activityLog
	 */
	function groupedActivityLog(
		activityLog:
			| ResourceUtilizationForApp$result['team']['environment']['application']['activityLog']
			| null
			| undefined,
		domain: [Date, Date] | undefined = brushXDomain
	) {
		if (!activityLog) {
			return [];
		}
		let intervalSeconds: number;
		switch (interval) {
			case '1h':
				intervalSeconds = 1 * 60 * 2; // 2 minutes
				break;
			case '6h':
				intervalSeconds = 4 * 60 * 2; // 8 minutes
				break;
			case '1d':
				intervalSeconds = 10 * 60 * 2; // 20 minutes
				break;
			case '30d':
				intervalSeconds = 12 * 60 * 60 * 2; // 24 hours
				break;
			default:
				intervalSeconds = 1.5 * 60 * 60 * 2; // 3 hours
				break;
		}

		if (!domain && $ResourceUtilizationForApp.variables) {
			domain = [
				$ResourceUtilizationForApp.variables.start,
				$ResourceUtilizationForApp.variables.end
			];
		}

		if (domain && chartWidth) {
			// Calculate interval that fits the chart width
			const totalSeconds = (domain[1].getTime() - domain[0].getTime()) / 1000;
			const annotationWidth = 20;
			intervalSeconds = Math.ceil(totalSeconds / (chartWidth / annotationWidth));
		}

		return activityLog.nodes.reduceRight((acc, log) => {
			let logTime = Math.floor(log.createdAt.getTime() / 1000);
			if (acc.length > 0 && logTime - acc.at(-1)!.timestamp < intervalSeconds) {
				acc.at(-1)!.logs.push(log);
			} else {
				acc.push({
					timestamp: logTime,
					logs: [log]
				});
			}
			return acc;
		}, [] as groupedLogs[]);
	}

	function isIn10PercentRange(n: number, target: number): boolean {
		const lowerBound = target * 0.9; // 10% less than the target
		const upperBound = target * 1.1; // 10% more than the target
		return n >= lowerBound && n <= upperBound;
	}

	const cpuReqRecommendation = $derived(
		$ResourceUtilizationForApp.data?.team.environment.application.utilization.recommendations
			.cpuRequestCores ?? 0
	);

	const cpuReq = $derived(
		$ResourceUtilizationForApp.data?.team.environment.application.resources.requests.cpu ?? 0
	);

	const cpuLimit = $derived(
		$ResourceUtilizationForApp.data?.team.environment.application.resources.limits.cpu
	);

	const memReqRecommendation = $derived(
		$ResourceUtilizationForApp.data?.team.environment.application.utilization.recommendations
			.memoryRequestBytes ?? 0
	);

	const memReq = $derived(
		$ResourceUtilizationForApp.data?.team.environment.application.resources.requests.memory ?? 0
	);
	const memLimit = $derived(
		$ResourceUtilizationForApp.data?.team.environment.application.resources.limits.memory ?? 0
	);
	const memLimitRecommendation = $derived(
		$ResourceUtilizationForApp.data?.team.environment.application.utilization.recommendations
			.memoryLimitBytes ?? 0
	);

	const memoryChartData = $derived.by(() => {
		return (
			$ResourceUtilizationForApp.data?.team.environment.application.utilization.memory_series
				.reduce(
					(acc, d) => {
						const val = {
							timestamp: d.timestamp,
							value: d.value
						};
						const existing = acc.find((a) => a.key === d.instance);
						if (existing) {
							existing.data.push(val);
						} else {
							acc.push({
								key: d.instance,
								color: visualizationColors[acc.length % visualizationColors.length],
								data: [val]
							});
						}
						return acc;
					},
					[] as { key: string; color: string; data: { timestamp: Date; value: number }[] }[]
				)
				.filter((d) => d.data.length > 1) ?? []
		);
	});

	const cpuChartData = $derived.by(() => {
		return (
			$ResourceUtilizationForApp.data?.team.environment.application.utilization.cpu_series
				.reduce(
					(acc, d) => {
						const val = {
							timestamp: d.timestamp,
							value: d.value
						};
						const existing = acc.find((a) => a.key === d.instance);
						if (existing) {
							existing.data.push(val);
						} else {
							acc.push({
								key: d.instance,
								color: visualizationColors[acc.length % visualizationColors.length],
								data: [val]
							});
						}
						return acc;
					},
					[] as { key: string; color: string; data: { timestamp: Date; value: number }[] }[]
				)
				.filter((d) => d.data.length > 1) ?? []
		);
	});

	const memoryMax = $derived.by(() => {
		let max = Math.max(
			...($ResourceUtilizationForApp.data?.team.environment.application.utilization.memory_series.map(
				(d) => d.value
			) ?? [])
		);

		$ResourceUtilizationForApp.data?.team.environment.application.utilization.limit_memory_series.forEach(
			(d) => {
				if (d.value > max) {
					max = d.value;
				}
			}
		);

		$ResourceUtilizationForApp.data?.team.environment.application.utilization.requested_memory_series.forEach(
			(d) => {
				if (d.value > max) {
					max = d.value;
				}
			}
		);
		return max;
	});

	const cpuMax = $derived.by(() => {
		let max = Math.max(
			...($ResourceUtilizationForApp.data?.team.environment.application.utilization.cpu_series.map(
				(d) => d.value
			) ?? [])
		);

		$ResourceUtilizationForApp.data?.team.environment.application.utilization.limit_cpu_series.forEach(
			(d) => {
				if (d.value > max) {
					max = d.value;
				}
			}
		);

		$ResourceUtilizationForApp.data?.team.environment.application.utilization.requested_cpu_series.forEach(
			(d) => {
				if (d.value > max) {
					max = d.value;
				}
			}
		);
		return max;
	});

	let brushXDomain: [Date, Date] | undefined = $state(undefined);

	const activityLog = $derived(
		groupedActivityLog(
			$ResourceUtilizationForApp.data?.team.environment.application.activityLog,
			brushXDomain
		)
	);

	const annotations: ChartAnnotations = $derived.by(() => {
		if (!activityLog || !$ResourceUtilizationForApp.variables) return [];

		const endTime = $ResourceUtilizationForApp.variables.end.getTime() / 1000;
		const startTime = $ResourceUtilizationForApp.variables.start.getTime() / 1000;

		return activityLog
			.map((log) => {
				let logTime = log.timestamp;

				if (endTime < logTime || startTime > logTime) {
					return null;
				}

				return {
					type: 'point' as const,
					label: log.logs.length.toString(),
					details: log,
					x: new Date(logTime * 1000),
					r: 10,
					props: {
						circle: { class: 'annotation' },
						label: { class: 'annotation-text' }
					}
				} as ChartAnnotations[number];
			})
			.filter((d) => d !== null);
	});
</script>

<GraphErrors errors={$ResourceUtilizationForApp.errors} />

<div class="wrapper">
	{#if $ResourceUtilizationForApp.data}
		{@const utilization = $ResourceUtilizationForApp.data.team.environment.application.utilization}
		<div class="grid">
			<div class="card">
				<Heading level="2" size="medium" spacing
					><WalletFillIcon class="heading-aligned-icon" /> Cost of Unutilized CPU</Heading
				>
				<BodyShort spacing
					>Estimate of annual cost of unutilized CPU for application <strong
						>{$ResourceUtilizationForApp.data.team.environment.application.name}</strong
					> calculated from current utilization data.
				</BodyShort>

				<div class="cost-wrapper">
					<div class="cost-amount">
						{euroValueFormatter(
							round(
								yearlyOverageCost(
									UtilizationResourceType.CPU,
									(cpuReq ?? 0) - (utilization.cpu_series.at(-1)?.value ?? 0),
									$ResourceUtilizationForApp.data.currentUnitPrices.cpu.value,
									$ResourceUtilizationForApp.data.currentUnitPrices.memory.value
								),
								0
							),
							{ maximumFractionDigits: 0 }
						)}
					</div>
				</div>
			</div>
			<div class="card">
				<Heading level="2" size="medium" spacing
					><WalletFillIcon class="heading-aligned-icon" /> Cost of Unutilized Memory</Heading
				>
				<BodyShort spacing
					>Estimate of annual cost of unutilized memory for application <strong
						>{$ResourceUtilizationForApp.data.team.environment.application.name}</strong
					> calculated from current utilization data.</BodyShort
				>

				<div class="cost-wrapper">
					<div class="cost-amount">
						{euroValueFormatter(
							round(
								yearlyOverageCost(
									UtilizationResourceType.MEMORY,
									memReq - (utilization.memory_series.at(-1)?.value ?? 0),
									$ResourceUtilizationForApp.data.currentUnitPrices.cpu.value,
									$ResourceUtilizationForApp.data.currentUnitPrices.memory.value
								),
								0
							),
							{ maximumFractionDigits: 0 }
						)}
					</div>
				</div>
			</div>
		</div>
		{#if !$ResourceUtilizationForApp.errors && (!isIn10PercentRange(cpuReq, cpuReqRecommendation) || cpuLimit || !isIn10PercentRange(memReq, memReqRecommendation) || !isIn10PercentRange(memLimit, memLimitRecommendation))}
			<Heading level="2" size="medium" spacing>Resource Settings and Recommendations</Heading>
			<BodyLong>
				<div>
					⚠️ Your app's resource settings are outside the recommended range. Consider adjusting them
					to optimize performance and cost.
				</div>
				<div>
					Read more about setting resources in the
					<a
						href={docURL(
							'/workloads/explanations/good-practices/?h=limit#set-reasonable-resource-requests-and-limits'
						)}>Nais documentation.</a
					>
				</div>
			</BodyLong>

			<Table size="small">
				<Thead>
					<Tr>
						<Th>Resource Type</Th>
						<Th>Current Value</Th>
						<Th>Recommended Value</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#if !isIn10PercentRange(cpuReq, cpuReqRecommendation)}
						<Tr>
							<Td>CPU Request</Td>
							<Td>{cpuReq ? formatKubernetesCPU(cpuReq) : 'Using default (200m)'}</Td>
							<Td>{formatKubernetesCPU(cpuReqRecommendation)}</Td>
						</Tr>
					{/if}
					{#if cpuLimit}
						<Tr>
							<Td>CPU Limit</Td>
							<Td>{formatKubernetesCPU(cpuLimit)}</Td>
							<Td>CPU Limit is generally not recommended</Td>
						</Tr>
					{/if}
					{#if !isIn10PercentRange(memReq, memReqRecommendation)}
						<Tr>
							<Td>Memory Request</Td>
							<Td>{memReq ? formatKubernetesMemory(memReq) : 'Using default (256Mi)'}</Td>
							<Td>{formatKubernetesMemory(memReqRecommendation)}</Td>
						</Tr>
					{/if}
					{#if !isIn10PercentRange(memLimit, memLimitRecommendation)}
						<Tr>
							<Td>Memory Limits</Td>
							<Td>{memLimit ? formatKubernetesMemory(memLimit) : 'Using default (512Mi)'}</Td>
							<Td>{formatKubernetesMemory(memLimitRecommendation)}</Td>
						</Tr>
					{/if}
				</Tbody>
			</Table>
			<ReadMore header="About Resource Recommendations">
				<div>
					<p>
						These recommendations are based on actual usage data from the past week, during working
						hours (weekdays, 06:00-18:00). They are intended to help right-size workloads to improve
						resource efficiency and reduce costs.
					</p>
					How recommendations are calculated:
					<dl>
						<dt><strong>CPU Request:</strong></dt>
						<dd>
							The highest average CPU usage during the timeframe. This helps ensure your app has
							enough CPU during peak usage, without over-allocating.
						</dd>
						<dt><strong>CPU Limit:</strong></dt>
						<dd>
							We do not recommend CPU limits, as the workload can utilize the shared resources.
						</dd>
						<dt><strong>Memory Request:</strong></dt>
						<dd>
							The 80th percentile of memory usage during the timeframe, then taking the maximum
							observed value. This aims to strike a balance between stability and efficient memory
							usage.
						</dd>
						<dt><strong>Memory Limit:</strong></dt>
						<dd>
							The 95th percentile of memory usage during the timeframe, using the maximum value seen
							across the week. This is meant to cap usage at a safe level without risking
							unnecessary OOM kills.
						</dd>
					</dl>
					Use these values as guidance when adjusting your resource settings. Properly tuned resource
					requests and limits help avoid both over-provisioning, wasting money and resources, and instability.
				</div>
			</ReadMore>
		{/if}

		<div class="section">
			<div class="heading-with-toggle">
				<Heading level="2" size="medium" spacing>CPU Usage</Heading>
				<ToggleGroup
					value={interval}
					onchange={(interval) => changeParams({ interval }, { noScroll: true })}
				>
					{#each ['1h', '6h', '1d', '7d', '30d'] as interval (interval)}
						<ToggleGroupItem value={interval}>{interval}</ToggleGroupItem>
					{/each}
				</ToggleGroup>
			</div>
			<div class="chart h-[330px]">
				<AreaChart
					series={cpuChartData}
					x="timestamp"
					y="value"
					brush={{
						onBrushEnd(detail) {
							brushXDomain = detail.xDomain as [Date, Date];
						}
					}}
					yDomain={[0, cpuMax]}
					xDomain={[
						$ResourceUtilizationForApp.variables?.start,
						$ResourceUtilizationForApp.variables?.end
					]}
					props={{
						yAxis: {
							// format: prettyBytes
						},
						highlight: {
							points: false
						},
						area: {
							motion: 'none'
						}
					}}
					{annotations}
				>
					{#snippet aboveMarks()}
						<AnnotationSeries
							data={utilization.requested_cpu_series}
							colorClass="stroke-warning [stroke-dasharray:2,2]"
							label="Request"
							labelColorClass="fill-warning"
						/>
						<AnnotationSeries
							data={utilization.limit_cpu_series}
							colorClass="stroke-danger [stroke-dasharray:2,2]"
							label="Limit"
							labelColorClass="fill-danger"
							labelPosition="below"
						/>
					{/snippet}
					{#snippet tooltip({ context })}
						<Tooltip.Root>
							{#snippet children({ data, payload })}
								{#if data.annotation}
									{@const log = data.annotation.details as groupedLogs}
									{#each log.logs as l (l.id)}
										<div class="whitespace-nowrap">
											{format(l.createdAt, 'dd/MM/yyyy HH:mm')} -
											{#if l.__typename == 'DeploymentActivityLogEntry'}
												New release
											{:else if l.__typename == 'ApplicationScaledActivityLogEntry'}
												Scaled {l.appScaled.direction} to
												{l.appScaled.newSize}
											{:else}
												{l.__typename}
											{/if}
										</div>
									{/each}
								{:else}
									{@const request = utilization.requested_cpu_series.find(
										(d) => d.timestamp.getTime() === context.x(data).getTime()
									)?.value}
									{@const limit = utilization.limit_cpu_series.find(
										(d) => d.timestamp.getTime() === context.x(data).getTime()
									)?.value}
									<Tooltip.Header>{format(context.x(data), 'dd/MM/yyyy HH:mm')}</Tooltip.Header>
									<Tooltip.List>
										{#each payload.filter((p) => p.value && p.value > 0) as p, i (p.key ?? i)}
											<Tooltip.Item label={p.name} color={p.color} valueAlign="right">
												{p.value.toFixed(3)}
											</Tooltip.Item>
										{/each}
										{#if request || limit}
											<Tooltip.Separator />
										{/if}
										{#if request}
											<Tooltip.Item
												label="Request"
												color="var(--color-warning)"
												value={request}
												format={(v) => {
													return v.toFixed(3);
												}}
												valueAlign="right"
											/>
										{/if}
										{#if limit}
											<Tooltip.Item
												label="Limit"
												color="var(--color-danger)"
												value={limit}
												format={(v) => {
													return v.toFixed(3);
												}}
												valueAlign="right"
											/>
										{/if}
									</Tooltip.List>
								{/if}
							{/snippet}
						</Tooltip.Root>
					{/snippet}
				</AreaChart>
			</div>
			<ReadMore header="Analyzing Your CPU Usage">
				<BodyLong>
					This graph show your workload's CPU usage over time. <ul>
						<li>
							<strong>Requests</strong> (grey line): The minimum amount of CPU guaranteed to your app.
						</li>
						<li>
							<strong>Limits</strong> (red line, if present): The maximum amount of CPU your app can
							use.
						</li>
						<li>Shaded Areas: The actual CPU usage of each running instance over time.</li>
					</ul>
					Your app can use more than its requested CPU if available, but exceeding the request might
					lead to
					<strong>CPU throttling</strong>, which can impact performance. However, this is usually
					not a problem for most applications, as Kubernetes is designed to handle resource
					contention gracefully. In many cases, workloads can burst beyond their requests when
					resources are available, ensuring smooth operation during short spikes in demand.
				</BodyLong>
				<Heading level="3" size="small" spacing>Optimize your CPU settings</Heading>
				<BodyLong>
					<div>
						✅ If CPU usage is consistently below the request, consider lowering the request to
						reduce costs and resource waste.
					</div>
					<div>
						✅ CPU throttling usually happens when a <strong>CPU limit</strong> is set. Not setting a
						limit allows the container to burst above its request, improving responsiveness during brief
						spikes.
					</div>
					<div>
						Read more about CPU best practices in the <a
							href={docURL(
								'/workloads/explanations/good-practices/?h=limit#set-reasonable-resource-requests-and-limits'
							)}
						>
							Nais documentation.
						</a>
					</div>
				</BodyLong>
			</ReadMore>
		</div>
		<div class="section" bind:clientWidth={chartWidth}>
			<div class="heading-with-toggle">
				<Heading level="2" size="medium" spacing>Memory Usage</Heading>
				<ToggleGroup
					value={interval}
					onchange={(interval) => changeParams({ interval }, { noScroll: true })}
				>
					{#each ['1h', '6h', '1d', '7d', '30d'] as interval (interval)}
						<ToggleGroupItem value={interval}>{interval}</ToggleGroupItem>
					{/each}
				</ToggleGroup>
			</div>

			<div class="chart h-[330px]">
				<AreaChart
					series={memoryChartData}
					x="timestamp"
					y="value"
					brush={{
						onBrushEnd(detail) {
							brushXDomain = detail.xDomain as [Date, Date];
						}
					}}
					yDomain={[0, memoryMax]}
					xDomain={[
						$ResourceUtilizationForApp.variables?.start,
						$ResourceUtilizationForApp.variables?.end
					]}
					props={{
						yAxis: {
							format: prettyBytes
						},
						highlight: {
							points: false
						},
						area: {
							motion: 'none'
						}
					}}
					{annotations}
				>
					{#snippet aboveMarks()}
						<AnnotationSeries
							data={utilization.requested_memory_series}
							colorClass="stroke-warning [stroke-dasharray:2,2]"
							label="Request"
							labelColorClass="fill-warning"
						/>
						<AnnotationSeries
							data={utilization.limit_memory_series}
							colorClass="stroke-danger [stroke-dasharray:2,2]"
							label="Limit"
							labelColorClass="fill-danger"
							labelPosition="below"
						/>
					{/snippet}
					{#snippet tooltip({ context })}
						<Tooltip.Root>
							{#snippet children({ data, payload })}
								{#if data.annotation}
									{@const log = data.annotation.details as groupedLogs}
									{#each log.logs as l (l.id)}
										<div class="whitespace-nowrap">
											{format(l.createdAt, 'dd/MM/yyyy HH:mm')} -
											{#if l.__typename == 'DeploymentActivityLogEntry'}
												New release
											{:else if l.__typename == 'ApplicationScaledActivityLogEntry'}
												Scaled {l.appScaled.direction} to
												{l.appScaled.newSize}
											{:else}
												{l.__typename}
											{/if}
										</div>
									{/each}
								{:else}
									{@const request = utilization.requested_memory_series.find(
										(d) => d.timestamp.getTime() === context.x(data).getTime()
									)?.value}
									{@const limit = utilization.limit_memory_series.find(
										(d) => d.timestamp.getTime() === context.x(data).getTime()
									)?.value}
									<Tooltip.Header>{format(context.x(data), 'dd/MM/yyyy HH:mm')}</Tooltip.Header>
									<Tooltip.List>
										{#each payload.filter((p) => p.value && p.value > 0) as p, i (p.key ?? i)}
											<Tooltip.Item label={p.name} color={p.color} valueAlign="right">
												{prettyBytes(p.value)}
											</Tooltip.Item>
										{/each}
										{#if request || limit}
											<Tooltip.Separator />
										{/if}
										{#if request}
											<Tooltip.Item
												label="Request"
												color="var(--color-warning)"
												value={request}
												format={prettyBytes}
												valueAlign="right"
											/>
										{/if}
										{#if limit}
											<Tooltip.Item
												label="Limit"
												color="var(--color-danger)"
												value={limit}
												format={prettyBytes}
												valueAlign="right"
											/>
										{/if}
									</Tooltip.List>
								{/if}
							{/snippet}
						</Tooltip.Root>
					{/snippet}
				</AreaChart>
			</div>
			<ReadMore header="Analyzing Your Memory Usage">
				<BodyLong>
					This graph show your workloads's memory usage over time. <ul>
						<li>
							<strong>Requests</strong> (grey line): The minimum amount of memory guaranteed to your
							app.
						</li>
						<li>
							<strong>Limits</strong> (red line, if present): The maximum amount of memory your app can
							use.
						</li>
						<li>Shaded Areas: The actual memory usage of each running instance over time.</li>
					</ul>
					Your app can use more than its requested memory if available, but exceeding the memory
					<strong>limit</strong>
					will cause the instance to be terminated (<code>OOMKilled</code>).

					<div><strong>Optimize your memory settings:</strong></div>
					<div>
						✅ If memory usage is consistently below the request, consider lowering the request to
						reduce overall cost and resource waste.
					</div>
					<div>
						✅ Memory limits are useful for containing runaway memory usage, but setting them too
						low may cause instability.
					</div>
					<div>
						Read more about memory best practices in the <a
							href={docURL(
								'/workloads/explanations/good-practices/?h=limit#set-reasonable-resource-requests-and-limits'
							)}
						>
							Nais documentation.
						</a>
					</div>
				</BodyLong>
			</ReadMore>
		</div>
	{:else}
		<div style="height: 380px; display: flex; justify-content: center; align-items: center;">
			<Loader size="3xlarge" />
		</div>
	{/if}
</div>

<style>
	.wrapper {
		display: grid;
		gap: var(--ax-space-24);
	}
	.heading-with-toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.section {
		display: grid;
	}

	.grid {
		margin-top: 1rem;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}

	.card {
		background-color: var(--ax-bg-sunken);
		padding: var(--ax-space-16) var(--ax-space-20);
		border-radius: 12px;
		align-items: stretch;
	}

	.cost-wrapper {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.cost-amount {
		background-color: var(--ax-bg-raised);
		font-size: 1.5rem;
		border-radius: 0.375rem;
		display: inline-block;
		align-items: center;
		padding: var(--ax-space-8) var(--ax-space-32);
	}

	.chart {
		margin-top: var(--ax-space-16);

		:global(.annotation) {
			background-color: var(--ax-bg-neutral-strong);
		}

		:global(.annotation-text) {
			fill: var(--ax-text-neutral-contrast);
			font-size: 10px;
		}
	}
</style>
