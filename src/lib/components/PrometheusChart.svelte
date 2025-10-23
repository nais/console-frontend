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
				return 60;
			case PrometheusChartQueryInterval.SixHours:
				return 6 * 60;
			case PrometheusChartQueryInterval.OneDay:
				return 24 * 60;
			case PrometheusChartQueryInterval.SevenDays:
				return 7 * 24 * 60;
			case PrometheusChartQueryInterval.ThirtyDays:
				return 30 * 24 * 60;
			default:
				return 60;
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
</script>

<script lang="ts">
	import { graphql } from '$houdini';
	import LegendWrapper, { legendSnippet } from '$lib/chart/LegendWrapper.svelte';
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

	const fetchGQL = () => {
		const end = new Date();
		const start = getStartFromInterval(interval);
		const step = getStepFromInterval(interval);
		q.fetch({ variables: { input: { query, range: { start, end, step } }, environmentName } });
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
		if ((interval as string) != '' && !allowed) {
			firstTimeLoad = false;
		}
	});

	const series = $derived.by(() => {
		if ($q.data) {
			const metrics = $q.data.environment.metrics.series;
			if (metrics.length == 0) return [];

			const series = metrics.map((metric, i) => {
				const lbl = labelFormatter(metric.labels);
				return {
					key: lbl,
					data: metric.values,
					color: colorizer(lbl, i)
				};
			});

			return series;
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
</script>

<LegendWrapper {height} bind:ref={htmlRef}>
	<LineChart
		{series}
		x="timestamp"
		y="value"
		legend={legendSnippet}
		yDomain={[0, maxValue > minScale ? null : minScale]}
		props={{
			spline: {
				class: 'stroke-2'
			},
			tooltip: {
				hideTotal: true
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
						{#each payload as p, i (p.key ?? i)}
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
