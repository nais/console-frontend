<script lang="ts">
	import { page } from '$app/state';
	import EChart from '$lib/chart/EChart.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import type { EChartsOption } from 'echarts';

	import { changeParams } from '$lib/utils/searchparams';
	import { visualizationColors } from '$lib/visualizationColors';
	import {
		BodyLong,
		Heading,
		Loader,
		ToggleGroup,
		ToggleGroupItem
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
							<hr style="border: none; height: 1px; background-color: var(--ax-border-subtle, --a-border-subtle);" />
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
</script>

<GraphErrors errors={$ResourceUtilizationForApp.errors} />

<div class="wrapper">
	<Heading size="medium" level="2">Analyzing Your Resource Usage</Heading>
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
		<div>✅ If usage is consistently below requests, consider lowering requests to save money.</div>
		<div>
			✅ If CPU is frequently throttled, increasing the CPU limit may improve performance.
			Alternatively, omitting a CPU limit allows unlimited usage, but may cause resource contention.
		</div>
	</BodyLong>
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
		gap: var(--ax-space-24, --a-spacing-6);
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
