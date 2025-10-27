<script lang="ts">
	import { browser } from '$app/environment';
	import { graphql } from '$houdini';
	import LegendWrapper, { legendSnippet } from '$lib/chart/LegendWrapper.svelte';
	import { intersect } from '$lib/utils/intersectionObserver';
	import { Loader } from '@nais/ds-svelte-community';
	import * as d3 from 'd3-time';
	import { LineChart, Tooltip } from 'layerchart';
	import { untrack } from 'svelte';
	import {
		getStartFromInterval,
		getStepFromInterval,
		PrometheusChartQueryInterval,
		replaceQueryVariables
	} from './util';

	const minScale = 1;

	type PrometheusChartProps = {
		environmentName: string;
		query: string;
		height?: `${number}px`;
		labelFormatter: (labels: { name: string; value: string }[]) => string;
		colorizer?: (label: string, index: number) => string;
		formatYValue?: (value: number) => string;
		formatXValue?: (value: number) => string;
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
	let allowLoading = $state(false);
	let firstTimeLoad = $state(false);

	// Intersection observer callback
	const handleIntersection = (isVisible: boolean) => {
		if (!isVisible) {
			// Only allow loading when in view
			allowLoading = false;
			return;
		}

		// Set allow loading when in view, but only when not already true
		// This prevents repeated state changes when the observer fires multiple times
		if (!allowLoading) {
			allowLoading = true;
		}
		if (!firstTimeLoad) {
			firstTimeLoad = true;
		}
	};

	// Compute series from GraphQL data
	const series = $derived.by(() => {
		if ($q.data) {
			const metrics = $q.data.environment.metrics.series;
			if (metrics.length == 0) return [];

			return metrics.map((metric, i) => {
				const lbl = labelFormatter(metric.labels);
				return {
					key: lbl,
					data: metric.values.map((point) => ({
						timestamp: new Date(point.timestamp),
						value: point.value
					})),
					color: colorizer(lbl, i)
				};
			});
		}
		return [];
	});

	// Compute chart data from series
	const chartData = $derived.by(() => {
		// Always return chart data, even if empty
		if (!$q.data || series.length === 0) {
			const fallbackStart = getStartFromInterval(interval);
			return {
				series: [],
				maxValue: minScale,
				yDomain: [0, minScale] as [number, number],
				xDomain: [fallbackStart, new Date()] as [Date, Date],
				tickInterval: null, // No ticks when no data
				timeSpanHours: 0
			};
		}

		// Calculate max value and min timestamp in one pass
		let maxValue = -Infinity;
		let minTimestamp: Date | null = null;

		for (const s of series) {
			if (s.data.length > 0) {
				// Check first timestamp for min
				const firstTimestamp = s.data[0].timestamp;
				if (!minTimestamp || firstTimestamp < minTimestamp) {
					minTimestamp = firstTimestamp;
				}

				// Find max value in this series
				for (const point of s.data) {
					if (point.value > maxValue) {
						maxValue = point.value;
					}
				}
			}
		}

		// Calculate appropriate tick interval based on actual data time range
		const dataStart = minTimestamp || getStartFromInterval(interval);
		const dataEnd = new Date();
		const timeSpanHours = (dataEnd.getTime() - dataStart.getTime()) / (1000 * 60 * 60);

		let tickInterval;
		if (timeSpanHours <= 2) {
			tickInterval = d3.timeMinute.every(15);
		} else if (timeSpanHours <= 12) {
			tickInterval = d3.timeHour.every(1);
		} else if (timeSpanHours <= 48) {
			tickInterval = d3.timeHour.every(4);
		} else if (timeSpanHours <= 168) {
			// 7 days
			tickInterval = d3.timeDay.every(1);
		} else {
			tickInterval = d3.timeDay.every(Math.ceil(timeSpanHours / (24 * 10))); // Max ~10 ticks
		}

		return {
			series,
			maxValue,
			yDomain: [0, maxValue > minScale ? maxValue : minScale] as [number, number],
			xDomain: [dataStart, dataEnd] as [Date, Date],
			tickInterval,
			timeSpanHours
		};
	});

	// Calculate dynamic padding based on content
	const dynamicPadding = $derived.by(() => {
		const { maxValue } = chartData;

		// Estimate Y-axis label width based on formatted max value
		const maxValueText = formatYValue(maxValue);
		// Rough estimation: ~8px per character + some buffer
		const estimatedLabelWidth = Math.max(20, maxValueText.length * 8 + 20);

		return {
			left: estimatedLabelWidth,
			right: 30,
			top: 20,
			bottom: 40
		};
	});

	// Determine overlay state
	const overlayState = $derived.by(() => {
		if ($q.fetching || $q.data === null) {
			return 'loading';
		}
		if ($q.data && series.length === 0) {
			return 'no-data';
		}
		return null;
	});
	const processedQuery = $derived(replaceQueryVariables(query, interval));

	const fetchGQL = () => {
		if (!browser) {
			return;
		}
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

	function formatXAxis(value: number) {
		const { timeSpanHours } = chartData;
		const date = new Date(value);

		// Format based on actual data time span
		if (timeSpanHours <= 36) {
			// For spans ≤ 1.5 days, show date at midnight, otherwise show time
			if (date.getHours() === 0 && date.getMinutes() === 0) {
				return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
			} else {
				return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
			}
		} else {
			// For longer spans, show date
			return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
		}
	}
</script>

<div class="prometheus-chart-wrapper" use:intersect={handleIntersection}>
	<LegendWrapper {height} bind:ref={htmlRef}>
		<LineChart
			series={chartData.series}
			x="timestamp"
			y="value"
			padding={dynamicPadding}
			xDomain={chartData.xDomain}
			legend={legendSnippet}
			yDomain={chartData.yDomain}
			props={{
				spline: {
					class: 'stroke-2'
				},
				xAxis: {
					format: formatXAxis,
					...(chartData.tickInterval && {
						ticks: {
							interval: chartData.tickInterval
						}
					})
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
		background: var(--ax-bg-sunken);
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
