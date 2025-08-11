<script lang="ts">
	import { page } from '$app/state';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import IconLabel from '$lib/components/IconLabel.svelte';
	import TooltipAlignHack from '$lib/components/TooltipAlignHack.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Heading, Loader, ToggleGroup, ToggleGroupItem } from '@nais/ds-svelte-community';
	import { GlobeIcon, HouseIcon, PadlockLockedIcon } from '@nais/ds-svelte-community/icons';
	import type { EChartsOption } from 'echarts';
	import type { CallbackDataParams } from 'echarts/types/dist/shared';
	import { tick } from 'svelte';
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
			grid: { left: 120 },
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

	// Scroll to ingress target and add a subtle pulse glow (1s fade-out)
	$effect(() => {
		if ($IngressMetrics.fetching) return;

		const q = page.url.searchParams.get('ingress');
		if (!q || !$IngressMetrics.data) return;

		const id = decodeURIComponent(q);

		let attempts = 0;
		const tryScroll = async () => {
			await tick(); // wait for DOM to render
			const el = document.getElementById(id) as HTMLElement | null;
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'start' });

				const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
				if (!prefersReduced) {
					const initial = getComputedStyle(el).backgroundColor || 'transparent';
					el.animate(
						[
							{ backgroundColor: 'color-mix(in srgb, var(--ax-accent, #2563eb) 12%, transparent)' }, // start: gentle tint
							{ backgroundColor: initial } // end: whatever it was
						],
						{ duration: 1500, easing: 'ease-out' }
					);
				}
			} else if (attempts < 10) {
				attempts++;
				setTimeout(tryScroll, 100);
			}
		};

		tryScroll();
	});
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
		{#each Object.entries(Object.groupBy($IngressMetrics.data.team.environment.application.ingresses, ({ type }) => type)) as [group, ingresses] (group)}
			{#each ingresses as ingress (ingress.url)}
				<div class="section" id={ingress.url}>
					<IconLabel size="large" level="2" label={ingress.url}>
						{#snippet icon()}
							<TooltipAlignHack
								content={`${ingress.type[0]}${ingress.type.slice(1).toLowerCase()} Ingress`}
							>
								{#if ingress.type === 'EXTERNAL'}
									<GlobeIcon />
								{:else if ingress.type === 'INTERNAL'}
									<HouseIcon />
								{:else if ingress.type === 'AUTHENTICATED'}
									<PadlockLockedIcon />
								{:else}
									<WarningIcon />
								{/if}
							</TooltipAlignHack>
						{/snippet}
					</IconLabel>

					<div class="chart-wrapper">
						<EChart options={options(ingress)} />
					</div>
				</div>
			{/each}
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

	.section {
		display: grid;
		scroll-margin-top: 72px; /* avoids sticky header overlap */
		border-radius: 12px; /* rounded corners */
		padding: var(--ax-space-16, 16px); /* inner space */
		background: color-mix(in srgb, Canvas 96%, transparent); /* subtle card bg */
		border: 1px solid color-mix(in srgb, CanvasText 12%, transparent); /* faint border */
	}

	.chart-wrapper {
		padding-block: 0.5rem 1rem; /* a touch more room under the title */
	}
</style>
