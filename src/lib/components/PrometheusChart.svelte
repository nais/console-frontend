<script lang="ts" module>
	export const PrometheusChartQueryInterval = {
		OneHour: '1h',
		SixHours: '6h',
		OneDay: '1d',
		SevenDays: '7d',
		ThirtyDays: '30d'
	} as const;

	export type PrometheusChartQueryInterval =
		(typeof PrometheusChartQueryInterval)[keyof typeof PrometheusChartQueryInterval];

	export function getStepFromInterval(interval: PrometheusChartQueryInterval): number {
		switch (interval) {
			case PrometheusChartQueryInterval.OneHour:
				return 30; // 30s step → 120 points
			case PrometheusChartQueryInterval.SixHours:
				return 180; // 3m step → 120 points
			case PrometheusChartQueryInterval.OneDay:
				return 720; // 12m step → 120 points
			case PrometheusChartQueryInterval.SevenDays:
				return 3600; // 1h step → 168 points
			case PrometheusChartQueryInterval.ThirtyDays:
				return 14400; // 4h step → 180 points
			default:
				return 30;
		}
	}

	export function getStartFromInterval(interval: PrometheusChartQueryInterval): Date {
		const now = new Date();
		switch (interval) {
			case PrometheusChartQueryInterval.OneHour:
				return new Date(now.getTime() - 1 * 60 * 60 * 1000);
			case PrometheusChartQueryInterval.SixHours:
				return new Date(now.getTime() - 6 * 60 * 60 * 1000);
			case PrometheusChartQueryInterval.OneDay:
				return new Date(now.getTime() - 24 * 60 * 60 * 1000);
			case PrometheusChartQueryInterval.SevenDays:
				return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			case PrometheusChartQueryInterval.ThirtyDays:
				return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
			default:
				return new Date(now.getTime() - 1 * 60 * 60 * 1000);
		}
	}

	export function getRateIntervalFromStep(stepSeconds: number): string {
		// Calculate optimal rate interval as 4x the step interval
		// with a minimum of the scrape interval (30s) and maximum of 5m
		const rateIntervalSeconds = Math.max(30, Math.min(300, stepSeconds * 4));

		if (rateIntervalSeconds >= 60) {
			return `${Math.floor(rateIntervalSeconds / 60)}m`;
		}
		return `${rateIntervalSeconds}s`;
	}

	export function replaceQueryVariables(
		query: string,
		interval: PrometheusChartQueryInterval
	): string {
		const stepSeconds = getStepFromInterval(interval);
		const rateInterval = getRateIntervalFromStep(stepSeconds);

		// Replace Grafana-style variables
		return query
			.replace(/\$__rate_interval/g, rateInterval)
			.replace(/\$__interval/g, `${stepSeconds}s`)
			.replace(/\$__interval_ms/g, `${stepSeconds * 1000}`);
	}
</script>

<script lang="ts">
	import { graphql } from '$houdini';
	import LegendWrapper, { legendSnippet } from '$lib/chart/LegendWrapper.svelte';
	import { Loader } from '@nais/ds-svelte-community';
	import { LineChart, Tooltip } from 'layerchart';
	import { untrack } from 'svelte';

	const minScale = 1;

	type PrometheusChartProps = {
		environmentName: string;
		query: string;
		height?: `${number}px`;
		labelFormatter: (labels: { name: string; value: string }[]) => string;
		colorizer?: (label: string, index: number) => string;
		formatYValue?: (value: number) => string;
		formatXValue?: (value: number) => string;
		formatXAxis?: (value: number) => string;
		interval?: PrometheusChartQueryInterval;
	};

	let {
		environmentName,
		query,
		labelFormatter,
		colorizer = colorFunc,
		height = '300px',
		formatYValue = (value: number) => {
			if (value % 1 !== 0) {
				return value.toFixed(2);
			}
			return value.toString();
		},
		formatXValue = (value: number) => new Date(value).toLocaleString('en-GB'),
		formatXAxis = (value: number) =>
			new Date(value).toLocaleString('en-GB', { month: 'short', day: 'numeric' }),
		interval = PrometheusChartQueryInterval.SevenDays
	}: PrometheusChartProps = $props();

	const q = graphql(`
		query PrometheusQuery($input: MetricsQueryInput!, $environmentName: String!) {
			environment(name: $environmentName) {
				metrics(input: $input) {
					series {
						labels {
							name
							value
						}
						values {
							timestamp
							value
						}
					}
					warnings
				}
			}
		}
	`);

	let htmlRef = $state<HTMLDivElement | null>(null);
	let observer: IntersectionObserver | undefined = undefined;
	let allowLoading = $state(false);
	let firstTimeLoad = $state(false);

	// Process query with variable replacement
	const processedQuery = $derived(replaceQueryVariables(query, interval));

	const fetchGQL = () => {
		const end = new Date();
		const start = getStartFromInterval(interval);
		const step = getStepFromInterval(interval);
		q.fetch({
			variables: {
				input: { query: processedQuery, range: { start, end, step } },
				environmentName
			}
		});
	};

	$effect(() => {
		// Set up IntersectionObserver to track when chart is in view
		if (!htmlRef) {
			return;
		}

		if (!observer) {
			observer = new IntersectionObserver((entries) => {
				const isIntersecting = entries.find((e) => e.target === htmlRef)?.isIntersecting;
				if (!isIntersecting) {
					allowLoading = false;
					return;
				}

				if (!allowLoading) {
					allowLoading = true;
				}
				if (!firstTimeLoad) {
					firstTimeLoad = true;
				}
			});
			observer.observe(htmlRef);
		}

		return () => observer?.disconnect();
	});

	$effect(() => {
		// Load data when needed and the chart is within view
		const allowed = untrack(() => allowLoading);
		if (firstTimeLoad && allowed) {
			fetchGQL();
		}
	});

	$effect(() => {
		// Ensure we refetch data when interval changes, but first when the chart is within view
		const allowed = untrack(() => allowLoading);
		if ((interval as string) !== '' && !allowed) {
			firstTimeLoad = false;
		}
	});

	const series = $derived.by(() => {
		if ($q.data) {
			const metrics = $q.data.environment.metrics.series;
			if (metrics.length == 0) return [];

			return metrics.map((metric, i) => {
				const lbl = labelFormatter(metric.labels);
				return {
					key: lbl,
					data: metric.values,
					color: colorizer(lbl, i)
				};
			});
		}
		return [];
	});

	function colorFunc(label: string, index: number): string {
		const colors = [
			'#1f77b4',
			'#ff7f0e',
			'#2ca02c',
			'#d62728',
			'#9467bd',
			'#8c564b',
			'#e377c2',
			'#7f7f7f',
			'#bcbd22',
			'#17becf'
		];
		return colors[index % colors.length];
	}

	const maxValue = $derived.by(() =>
		series.reduce((max, item) => {
			const seriesMax = item.data.reduce((sMax, point) => {
				const v = point.value;
				return v > sMax ? v : sMax;
			}, -Infinity);
			return seriesMax > max ? seriesMax : max;
		}, -Infinity)
	);

	// Determine overlay state
	const overlayState = $derived.by(() => {
		if ($q.fetching) {
			return 'loading';
		}
		if ($q.data && series.length === 0) {
			return 'no-data';
		}
		return null;
	});
</script>

<div class="prometheus-chart-wrapper">
	<LegendWrapper {height} bind:ref={htmlRef}>
		<LineChart
			{series}
			x="timestamp"
			y="value"
			yPadding={[0, 30]}
			yNice={true}
			legend={legendSnippet}
			yDomain={[0, maxValue > minScale ? null : minScale]}
			props={{
				spline: {
					class: 'stroke-2'
				},
				xAxis: {
					format: formatXAxis
				},
				yAxis: {
					format: formatYValue
				}
			}}
		>
			{#snippet tooltip({ context })}
				<Tooltip.Root>
					{#snippet children({ data, payload })}
						<Tooltip.Header>{formatXValue(context.x(data))}</Tooltip.Header>
						<Tooltip.List>
							{#each payload.filter((p) => p.value !== undefined) as p, i (p.key ?? i)}
								<Tooltip.Item label={p.key} color={p.color}>
									{formatYValue(p.value)}
								</Tooltip.Item>
							{/each}
						</Tooltip.List>
					{/snippet}
				</Tooltip.Root>
			{/snippet}
		</LineChart>
	</LegendWrapper>

	{#if overlayState}
		<div class="prometheus-chart-overlay">
			<div class="prometheus-chart-overlay-content">
				{#if overlayState === 'loading'}
					<div class="prometheus-chart-loading">
						<Loader />
						<span>Loading...</span>
					</div>
				{:else if overlayState === 'no-data'}
					<span>No data available</span>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.prometheus-chart-wrapper {
		position: relative;
		margin-bottom: 3rem;
		padding-left: 24px;
	}

	.prometheus-chart-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
		backdrop-filter: blur(2px);
		pointer-events: none;
	}

	.prometheus-chart-overlay-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		background: var(--ax-bg-overlay);
		border-radius: 0.5rem;
		font-weight: 500;
		color: var(--ax-text-default);
	}

	.prometheus-chart-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}
</style>
