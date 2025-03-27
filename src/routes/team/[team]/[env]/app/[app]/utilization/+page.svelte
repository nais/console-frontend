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
		readonly instance: string;
	}[];

	const interval = $derived(page.url.searchParams.get('interval') ?? '7d');

	function options(
		data: resourceUsage,
		request: number,
		limit?: number,
		valueFormatter: (value: number) => string = (value: number) =>
			value == null ? '-' : value.toLocaleString('en-GB', { maximumFractionDigits: 4 })
	): EChartsOption {
		const safeData = data ?? [];

		const uniqueTimestamps = Array.from(new Set(safeData.map((d) => d.timestamp.getTime())));

		const opts = {
			grid: {
				bottom: 20,
				top: 16,
				left: 80,
				right: 51
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
				{
					data: uniqueTimestamps.map((timestamp) => [timestamp, request]),
					type: 'line',
					name: 'Request',
					showSymbol: false,
					color: requestColor,
					lineStyle: {
						color: requestColor,
						type: request === limit ? 'solid' : 'dashed'
					},
					markLine: {
						symbol: 'none',
						data: [
							{
								yAxis: request,
								label: {
									formatter: 'Request',
									position: 'end',
									color: requestColor,
									offset: request === limit ? [0, 8] : [0, 0]
								},
								lineStyle: { type: 'solid', color: 'transparent' }
							}
						]
					}
				},
				limit
					? {
							data: uniqueTimestamps.map((timestamp) => [timestamp, limit]),
							type: 'line',
							name: 'Limit',
							showSymbol: false,
							color: limitColor,
							lineStyle: { color: limitColor, type: 'dashed' },
							markLine: {
								symbol: 'none',
								data: [
									{
										yAxis: limit,
										label: {
											formatter: 'Limit',
											position: 'end',
											color: limitColor,
											offset: request === limit ? [0, -8] : [0, 0]
										},
										lineStyle: { type: 'solid', color: 'transparent' }
									}
								]
							}
						}
					: null
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
		<Heading level="2" size="medium" spacing>Memory usage</Heading>
		{#if $ResourceUtilizationForApp.data}
			{@const utilization =
				$ResourceUtilizationForApp.data.team.environment.application.utilization}
			<div style="justify-self: end;">
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
						utilization.requested_memory / 1024 / 1024 / 1024,
						utilization.limit_memory ? utilization.limit_memory / 1024 / 1024 / 1024 : undefined,
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
		<Heading level="2" size="medium" spacing>CPU usage</Heading>
		{#if $ResourceUtilizationForApp.data}
			{@const utilization =
				$ResourceUtilizationForApp.data.team.environment.application.utilization}
			<div style="justify-self: end;">
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
						utilization.requested_cpu,
						utilization.limit_cpu ? utilization.limit_cpu : undefined,
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

	.section {
		display: grid;
	}

	.chart-wrapper {
		padding-block: 1rem;
	}
</style>
