<script lang="ts">
	import { page } from '$app/state';
	import EChart from '$lib/chart/EChart.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import type { EChartsOption } from 'echarts';

	import { docURL } from '$lib/doc';
	import { formatKubernetesCPU, formatKubernetesMemory } from '$lib/utils/formatters';
	import { changeParams } from '$lib/utils/searchparams';
	import { visualizationColors } from '$lib/visualizationColors';
	import {
		BodyLong,
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
	import { format } from 'date-fns';
	import type { CallbackDataParams } from 'echarts/types/dist/shared';
	import prettyBytes from 'pretty-bytes';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { ResourceUtilizationForApp } = $derived(data);

	type resourceUsage = {
		readonly timestamp: Date;
		readonly value: number;
		readonly instance?: string;
	}[];

	const interval = $derived(page.url.searchParams.get('interval') ?? '7d');

	function options(
		data: resourceUsage,
		request: resourceUsage,
		limit?: resourceUsage,
		valueFormatter: (value: number) => string = (value: number) =>
			value == null ? '-' : value.toLocaleString('en-GB', { maximumFractionDigits: 4 })
	): EChartsOption {
		const safeData = data ?? [];
		const safeRequest = request ?? [];
		const safeLimit = limit ?? [];

		const opts = {
			grid: {
				bottom: 20,
				top: 16,
				left: 80,
				right: 60
			},
			animation: false,
			tooltip: {
				trigger: 'axis',
				formatter: (value: CallbackDataParams[]) => {
					const dot = (color: string) =>
						`<div style="height: 8px; width: 8px; border-radius: 50%; background-color: ${color};"></div>`;
					const div = document.createElement('div');

					div.innerHTML = `
							<div>${format(
								Array.isArray(value) && Array.isArray(value[0]?.value)
									? (value[0].value[0] as number)
									: 0,
								'dd/MM/yyyy HH:mm'
							)}</div>
							<hr style="border: none; height: 1px; background-color: var(--a-border-subtle);" />
							<div style="display: grid; grid-template-columns: auto auto; column-gap: 0.5rem;">
								${value
									.map(
										(v) =>
											`<div style="display: flex; align-items: center; gap: 0.25rem;">${dot(
												v.color?.toString() ?? ''
											)}${v.seriesName}</div><div style="text-align: right;">${valueFormatter(
												(Array.isArray(v.value) ? v.value[1] : null) as number
											)}</div>`
									)
									.join('')}
							</div>
						`;
					return div;
				},
				axisPointer: {
					animation: false
				}
			},
			xAxis: {
				type: 'time',
				boundaryGap: false,
				axisLabel: { formatter: { month: '{MMM} {d}', day: '{dd}.{MM}' } }
			},
			yAxis: {
				type: 'value',
				axisLabel: {
					formatter: valueFormatter
				}
			},
			series: [
				...Array.from(new Set(safeData.map((d) => d.instance))).map((instance, index) => ({
					name: instance,
					type: 'line',
					data: safeData
						.filter((d) => d.instance === instance)
						.map((d) => [d.timestamp.getTime(), d.value]),
					showSymbol: false,
					color: visualizationColors[index % visualizationColors.length],
					areaStyle: {
						opacity: 0.2
					}
				})),
				...Array.from(new Set(safeRequest.map((d) => d.instance))).map((instance) => ({
					name: 'Request',
					type: 'line',
					data: safeRequest
						.filter((d) => d.instance === instance)
						.map((d) => [d.timestamp.getTime(), d.value]),
					showSymbol: false,
					color: requestColor,
					lineStyle: {
						color: requestColor,
						type: 'solid'
					},
					endLabel: {
						offset: [0, safeRequest.at(-1)?.value === safeLimit.at(-1)?.value ? 6 : 0],
						formatter: 'Request',
						position: 'end',
						color: requestColor,
						show: true
					}
				})),
				...Array.from(new Set(safeLimit.map((d) => d.instance))).map((instance) => ({
					name: 'Limit',
					type: 'line',
					data: safeLimit
						.filter((d) => d.instance === instance)
						.map((d) => [d.timestamp.getTime(), d.value]),
					showSymbol: false,
					color: limitColor,
					lineStyle: { color: limitColor, type: 'dashed' },
					endLabel: {
						offset: [0, safeRequest.at(-1)?.value === safeLimit.at(-1)?.value ? -6 : 0],
						formatter: 'Limit',
						position: 'end',
						color: limitColor,
						show: true
					}
				}))
			]
		} as EChartsOption;

		return opts;
	}

	const limitColor = '#DE2E2E';
	const requestColor = '#838C9A';

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
</script>

<GraphErrors errors={$ResourceUtilizationForApp.errors} />

<div class="wrapper">
	{#if $ResourceUtilizationForApp.data}
		{@const utilization = $ResourceUtilizationForApp.data.team.environment.application.utilization}
		{#if !isIn10PercentRange(cpuReq, cpuReqRecommendation) || cpuLimit || !isIn10PercentRange(memReq, memReqRecommendation) || !isIn10PercentRange(memLimit, memLimitRecommendation)}
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
							The highest average CPU usage (5-minute rate) across all 5-minute windows during the
							selected timeframe. This helps ensure your app has enough CPU during peak usage,
							without over-allocating.
						</dd>
						<dt><strong>CPU Limit:</strong></dt>
						<dd>
							We do not recommend CPU limits, as the workload can utilize the shared resources.
						</dd>
						<dt><strong>Memory Request:</strong></dt>
						<dd>
							The 80th percentile of memory usage, averaged over all 5-minute windows, then taking
							the maximum observed value. This aims to strike a balance between stability and
							efficient memory usage.
						</dd>
						<dt><strong>Memory Limit:</strong></dt>
						<dd>
							The 95th percentile of memory usage, using the maximum value seen across the week.
							This is meant to cap usage at a safe level without risking unnecessary OOM kills.
						</dd>
					</dl>
					Use these values as guidance when adjusting your resource settings. Properly tuned resource
					requests and limits help avoid both over-provisioning, wasting money and resources, and instability.
				</div>
			</ReadMore>
		{/if}

		<div class="section">
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

			<div class="chart-wrapper">
				<EChart
					options={options(
						utilization.memory_series.map((d) => {
							return {
								timestamp: d.timestamp,
								value: d.value / 1024 / 1024 / 1024,
								instance: d.instance
							};
						}),
						utilization.requested_memory_series.map((d) => {
							return {
								timestamp: d.timestamp,
								value: d.value / 1024 / 1024 / 1024
							};
						}),
						utilization.limit_memory_series.map((d) => {
							return {
								timestamp: d.timestamp,
								value: d.value / 1024 / 1024 / 1024
							};
						}),
						(value) =>
							value == null
								? '-'
								: prettyBytes(value * 1024 ** 3, {
										locale: 'en',
										minimumFractionDigits: 0,
										maximumFractionDigits: 2,
										binary: true
									})
					)}
				/>
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
					Your app can use more than its requested memory if available, but exceeding the memory<strong
						>limit</strong
					>
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
			<div class="chart-wrapper">
				<EChart
					options={options(
						utilization.cpu_series,
						utilization.requested_cpu_series,
						utilization.limit_cpu_series,
						(value: number) =>
							value == null
								? '-'
								: `${value.toLocaleString('en-GB', { maximumFractionDigits: 4 })} CPUs`
					)}
				/>
			</div>
			<ReadMore header="Analyzing Your CPU Usage">
				<BodyLong>
					This graph show your workload's CPU usage over time. <ul>
						<li>
							<strong>Requests</strong> (grey line): The minimum amount of CPU guaranteed to your app.
						</li>
						<li>Shaded Areas: The actual CPU usage of each running instance over time.</li>
					</ul>
					Your app can use more than its requested CPU if available, but exceeding the request might
					lead to<strong>CPU throttling</strong>, which can impact performance. However, this is
					usually not a problem for most applications, as Kubernetes is designed to handle resource
					contention gracefully. In many cases, workloads can burst beyond their requests when
					resources are available, ensuring smooth operation during short spikes in demand.

					<div><strong>Optimize your CPU settings:</strong></div>
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
	{:else}
		<div style="height: 380px; display: flex; justify-content: center; align-items: center;">
			<Loader size="3xlarge" />
		</div>
	{/if}
</div>

<style>
	.wrapper {
		display: grid;
		gap: var(--a-spacing-6);
	}
	.heading-with-toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.section {
		display: grid;
	}

	.chart-wrapper {
		padding-block: 1rem;
	}
</style>
