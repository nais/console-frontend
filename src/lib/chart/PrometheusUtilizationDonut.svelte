<script lang="ts">
	import { browser } from '$app/environment';
	import { graphql } from '$houdini';
	import { intersect } from '$lib/utils/intersectionObserver';
	import { Loader } from '@nais/ds-svelte-community';
	import { Arc, Chart, Group, Svg, Text } from 'layerchart';
	import { untrack } from 'svelte';

	type PrometheusUtilizationDonutProps = {
		environmentName: string;
		query: string;
		label?: string;
		height?: `${number}px`;
		domainMax?: number;
		aggregation?: 'avg' | 'max' | 'sum';
		formatCenterValue?: (value: number) => string;
	};

	let {
		environmentName,
		query,
		label = 'Utilization',
		height = '170px',
		domainMax = 100,
		aggregation = 'avg',
		formatCenterValue = (value: number) => `${value.toFixed(1)}%`
	}: PrometheusUtilizationDonutProps = $props();

	const q = graphql(`
		query PrometheusUtilizationDonutQuery($input: MetricsQueryInput!, $environmentName: String!) {
			environment(name: $environmentName) {
				metrics(input: $input) {
					series {
						values {
							timestamp
							value
						}
					}
				}
			}
		}
	`);

	let allowLoading = $state(false);
	let firstTimeLoad = $state(false);

	const handleIntersection = (isVisible: boolean) => {
		if (!isVisible) {
			allowLoading = false;
			return;
		}

		if (!allowLoading) {
			allowLoading = true;
		}
		if (!firstTimeLoad) {
			firstTimeLoad = true;
		}
	};

	const latestSeriesValues = $derived.by(() => {
		if (!$q.data) {
			return [] as number[];
		}

		return $q.data.environment.metrics.series
			.map((series) => series.values.at(-1)?.value)
			.filter((value): value is number => value !== undefined && Number.isFinite(value));
	});

	const utilizationValue = $derived.by(() => {
		if (latestSeriesValues.length === 0) {
			return null;
		}

		if (aggregation === 'max') {
			return Math.max(...latestSeriesValues);
		}

		if (aggregation === 'sum') {
			return latestSeriesValues.reduce((sum, value) => sum + value, 0);
		}

		return latestSeriesValues.reduce((sum, value) => sum + value, 0) / latestSeriesValues.length;
	});

	const normalizedValue = $derived.by(() => {
		if (utilizationValue === null) {
			return 0;
		}

		if (utilizationValue < 0) {
			return 0;
		}

		if (utilizationValue > domainMax) {
			return domainMax;
		}

		return utilizationValue;
	});

	const segmentCount = 36;
	const segmentIndices = Array.from({ length: segmentCount }, (_, index) => index);
	const segmentRangeStart = -120;
	const segmentRangeEnd = 120;
	const segmentPadAngle = 0.03;
	const WARNING_THRESHOLD = 70;
	const DANGER_THRESHOLD = 90;

	const activeSegments = $derived.by(() => {
		if (domainMax <= 0) {
			return 0;
		}

		const ratio = Math.max(0, Math.min(1, normalizedValue / domainMax));
		return Math.round(ratio * segmentCount);
	});

	const segmentFill = (segmentIndex: number, isActive: boolean) => {
		if (!isActive) {
			return 'var(--ax-neutral-200)';
		}

		const segmentPercent = ((segmentIndex + 1) / segmentCount) * 100;

		if (segmentPercent <= WARNING_THRESHOLD) {
			return 'var(--ax-text-success-decoration)';
		}

		if (segmentPercent <= DANGER_THRESHOLD) {
			return 'var(--ax-text-warning-decoration)';
		}

		return 'var(--ax-text-danger-decoration)';
	};

	const overlayState = $derived.by(() => {
		if ($q.errors) {
			return 'error';
		}

		if ($q.fetching || $q.data === null) {
			return 'loading';
		}

		if ($q.data && utilizationValue === null) {
			return 'no-data';
		}

		return null;
	});

	const fetchGQL = () => {
		if (!browser) {
			return;
		}

		const time = new Date();
		q.fetch({
			variables: {
				input: { query, time },
				environmentName
			}
		});
	};

	$effect(() => {
		const allowed = untrack(() => allowLoading);
		if (firstTimeLoad && allowed) {
			fetchGQL();
		}
	});
</script>

<div
	class="utilization-segmented-chart"
	style="height: {height};"
	use:intersect={handleIntersection}
>
	<Chart>
		<Svg center>
			<Group y={16}>
				{@const segmentAngle =
					((segmentRangeEnd - segmentRangeStart) * Math.PI) / 180 / segmentCount}
				{#each segmentIndices as segmentIndex (segmentIndex)}
					{@const startAngle = (segmentRangeStart * Math.PI) / 180 + segmentIndex * segmentAngle}
					{@const endAngle = startAngle + segmentAngle}
					<Arc
						{startAngle}
						{endAngle}
						innerRadius={56}
						outerRadius={76}
						cornerRadius={4}
						padAngle={segmentPadAngle}
						fill={segmentFill(segmentIndex, segmentIndex < activeSegments)}
					/>
				{/each}
			</Group>
			{#if overlayState !== 'no-data'}
				<Text
					value={formatCenterValue(normalizedValue)}
					textAnchor="middle"
					verticalAnchor="middle"
					class="utilization-value"
					dy={2}
				/>
			{/if}
			<Text
				value={label}
				textAnchor="middle"
				verticalAnchor="middle"
				class="utilization-label"
				dy={26}
			/>
		</Svg>
	</Chart>

	{#if overlayState}
		<div class="utilization-donut-overlay">
			{#if overlayState === 'loading'}
				<div class="utilization-donut-loading">
					<Loader />
					<span>Loading...</span>
				</div>
			{:else if overlayState === 'error'}
				<span>Failed to load data</span>
			{:else}
				<span>No data available</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.utilization-segmented-chart {
		position: relative;
		width: 100%;
	}

	.utilization-donut-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(2px);
		pointer-events: none;
		color: var(--ax-text-neutral);
	}

	.utilization-donut-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--ax-space-4);
	}

	:global(.utilization-value) {
		font-size: var(--ax-font-size-large);
		font-weight: var(--ax-font-weight-bold);
	}

	:global(.utilization-label) {
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-regular);
	}
</style>
