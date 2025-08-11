<script lang="ts">
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Heading, Loader, ToggleGroup, ToggleGroupItem } from '@nais/ds-svelte-community';

	import { page } from '$app/state';
	import EChart from '$lib/chart/EChart.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import type { EChartsOption } from 'echarts';
	import type { CallbackDataParams } from 'echarts/types/dist/shared';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { IngressMetrics } = $derived(data);

	const interval = $derived(page.url.searchParams.get('interval') ?? '7d');

	interface Metric {
		timestamp: Date;
		value: number;
	}

	type Series = {
		metrics: {
			rps: Metric[];
			eps: Metric[];
		};
	};

	export function options(input: Series): EChartsOption {
		const toPoints = (arr: Metric[]) =>
			(arr ?? [])
				.map((m) => [m.timestamp.getTime(), m.value] as [number, number])
				.sort((a, b) => a[0] - b[0]);

		const rpsData = toPoints(input.metrics.rps);
		const epsData = toPoints(input.metrics.eps);

		const fmtTime = (ms: number) =>
			new Date(ms).toLocaleString('en-GB', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false
			});
		const fmtNum = (n: number | undefined) =>
			n !== undefined && Number.isFinite(n) ? (n as number).toFixed(2) : '-';

		const getX = (p: CallbackDataParams): number | undefined => {
			const d = p.data as unknown;
			if (Array.isArray(d) && d.length >= 2) {
				const xv = d[0] as number | string;
				return typeof xv === 'number' ? xv : Date.parse(String(xv));
			}
			const v = p.value as unknown;
			if (Array.isArray(v) && v.length >= 2) {
				const xv = v[0] as number | string;
				return typeof xv === 'number' ? xv : Date.parse(String(xv));
			}
			return undefined;
		};

		const getY = (p: CallbackDataParams): number | undefined => {
			const d = p.data as unknown;
			if (Array.isArray(d) && d.length >= 2) return Number(d[1] as number);
			const v = p.value as unknown;
			if (Array.isArray(v) && v.length >= 2) return Number(v[1] as number);
			if (typeof p.value === 'number') return p.value;
			return undefined;
		};

		return {
			grid: { left: 0 },
			legend: { data: ['req/s', 'err/s'], top: 0 },
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'cross' },
				formatter: (params: CallbackDataParams | CallbackDataParams[]) => {
					const list = Array.isArray(params) ? params : [params];
					const t = getX(list[0]!);
					const header = t !== undefined ? fmtTime(t) : '';

					const lines = list.map((p) => {
						const marker = (p as unknown as { marker?: string }).marker ?? '';
						return `${marker} ${p.seriesName}&nbsp;&nbsp;<b>${fmtNum(getY(p))}</b>`;
					});

					return [header, ...lines].filter(Boolean).join('<br/>');
				}
			},
			xAxis: { type: 'time', boundaryGap: [0, 0] },
			yAxis: [
				{ type: 'value', name: 'req/s', min: 0, alignTicks: true },
				{ type: 'value', name: 'err/s', min: 0, alignTicks: true }
			],
			dataZoom: [{ type: 'inside', throttle: 50 }, { type: 'slider' }],
			series: [
				{
					name: 'req/s',
					type: 'line',
					yAxisIndex: 0,
					showSymbol: false,
					smooth: 0.2,
					connectNulls: true,
					sampling: 'lttb',
					emphasis: { focus: 'series' },
					encode: { x: 0, y: 1, tooltip: [1] },
					data: rpsData
				},
				{
					name: 'err/s',
					type: 'line',
					yAxisIndex: 1,
					showSymbol: false,
					smooth: 0.2,
					connectNulls: true,
					sampling: 'lttb',
					emphasis: { focus: 'series' },
					encode: { x: 0, y: 1, tooltip: [1] },
					data: epsData
				}
			]
		};
	}
</script>

<GraphErrors errors={$IngressMetrics.errors} />

<div class="wrapper">
	{#if $IngressMetrics.fetching}
		<div style="display: flex; justify-content: center; align-items: center; min-height: 500px;">
			<Loader size="3xlarge" />
		</div>
	{:else if $IngressMetrics.data?.team.environment.application.ingresses && $IngressMetrics.data.team.environment.application.ingresses.length > 0}
		<div style="display: flex; justify-content: end">
			<ToggleGroup
				value={interval}
				onchange={(interval) => changeParams({ interval }, { noScroll: true })}
			>
				{#each ['1h', '6h', '1d', '7d', '30d'] as interval (interval)}
					<ToggleGroupItem value={interval}>{interval}</ToggleGroupItem>
				{/each}
			</ToggleGroup>
		</div>
		{#each $IngressMetrics.data.team.environment.application.ingresses as ingress (ingress.url)}
			<div class="section" id={ingress.url}>
				<div class="heading-with-toggle">
					<Heading level="2" size="medium" spacing>{ingress.url}</Heading>
				</div>

				<div class="chart-wrapper">
					<EChart options={options(ingress)} />
				</div>
			</div>
		{/each}
	{:else}
		<div class="no-data">
			<Heading level="2" size="medium" spacing>No Ingress Data Available</Heading>
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

	.chart-wrapper {
		padding-block: 1rem;
	}

	.chart-wrapper :global(svg > g > path) {
		/* hack to fix the fill rule of annotation icons */
		fill-rule: evenodd;
	}
</style>
