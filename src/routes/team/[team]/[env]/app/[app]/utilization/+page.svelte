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
		ExpansionCard,
		Heading,
		Loader,
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

	// function isIn10PercentRange(n: number, target: number): boolean {
	// 	const lowerBound = target * 0.9; // 10% less than the target
	// 	const upperBound = target * 1.1; // 10% more than the target
	// 	return n >= lowerBound && n <= upperBound;
	// }

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
	<ExpansionCard header="Analyzing Your Resource Usage">
		<BodyLong>
			These graphs show your application's CPU and memory usage.
			<ul>
				<li>
					<strong>Requests</strong> (grey line): The minimum CPU or memory guaranteed to your app.
				</li>
				<li>
					<strong>Limits</strong> (red line, if present): The maximum CPU or memory your app can use.
				</li>
				<li>
					Shaded Areas: The actual resource consumption over time for each running instance of your
					app.
				</li>
			</ul>
			Your app can use more than its requested amount if resources are available.
			<ul>
				<li>
					CPU: Exceeding requests might cause <strong>throttling</strong>, potentially reducing
					performance.
				</li>
				<li>
					Memory: Exceeding the limit will cause that specific app instance to be terminated
					(OOMKilled).
				</li>
			</ul>
			<div><strong>Optimize your resource settings:</strong></div>
			<div>
				✅ If usage is consistently below requests, consider lowering requests to save money.
			</div>
			<div>
				✅ CPU throttling typically happens when a CPU limit is set. Omitting the CPU limit lets the
				container burst beyond its request, which can improve performance, especially for
				short-lived spikes.
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
	</ExpansionCard>

	<Heading level="2" size="medium" spacing>Resource Settings and Recommendations</Heading>
	<Table size="small">
		<Thead>
			<Tr>
				<Th>Resource Type</Th>
				<Th>Current Value</Th>
				<Th>Recommended Value</Th>
			</Tr>
		</Thead>
		<Tbody>
			<Tr>
				<Td>CPU Request</Td>
				<Td>{cpuReq ? formatKubernetesCPU(cpuReq) : 'Using default (200m)'} ({cpuReq})</Td>
				<Td>{formatKubernetesCPU(cpuReqRecommendation)}({cpuReqRecommendation})</Td>
			</Tr>
			<Tr>
				<Td>CPU Limit</Td>
				<Td>{cpuLimit ? formatKubernetesCPU(cpuLimit) : 'Using default (no limit)'} ({cpuLimit})</Td
				>
				<Td>CPU Limit is generally not recommended</Td>
			</Tr>
			<Tr>
				<Td>Memory Request</Td>
				<Td>{memReq ? formatKubernetesMemory(memReq) : 'Using default (256Mi)'} ({memReq})</Td>
				<Td>{formatKubernetesMemory(memReqRecommendation)}({memReqRecommendation})</Td>
			</Tr>
			<Tr>
				<Td>Memory Limits</Td>
				<Td>{memLimit ? formatKubernetesMemory(memLimit) : 'Using default (512Mi)'} ({memLimit})</Td
				>
				<Td>{formatKubernetesMemory(memLimitRecommendation)}({memLimitRecommendation})</Td>
			</Tr>
		</Tbody>
	</Table>

	<div class="section">
		{#if $ResourceUtilizationForApp.data}
			{@const utilization =
				$ResourceUtilizationForApp.data.team.environment.application.utilization}
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
		{:else}
			<div style="height: 380px; display: flex; justify-content: center; align-items: center;">
				<Loader size="3xlarge" />
			</div>
		{/if}
	</div>
	<div class="section">
		{#if $ResourceUtilizationForApp.data}
			{@const utilization =
				$ResourceUtilizationForApp.data.team.environment.application.utilization}
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
		{:else}
			<div style="height: 380px; display: flex; justify-content: center; align-items: center;">
				<Loader size="3xlarge" />
			</div>
		{/if}
	</div>
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
