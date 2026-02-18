<script lang="ts">
	import { browser } from '$app/environment';
	import { graphql } from '$houdini';
	import { intersect } from '$lib/utils/intersectionObserver';
	import { Loader } from '@nais/ds-svelte-community';
	import { Arc, Chart, Group, LinearGradient, Svg, Text } from 'layerchart';
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

	function hashValue(input: string): string {
		let hash = 0;
		for (let index = 0; index < input.length; index++) {
			hash = (hash << 5) - hash + input.charCodeAt(index);
			hash |= 0;
		}
		return Math.abs(hash).toString(36);
	}

	const gradientId = $derived(`utilization-donut-gradient-${hashValue(`${label}:${query}`)}`);

	const overlayState = $derived.by(() => {
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

<div class="utilization-donut-wrapper" style="height: {height};" use:intersect={handleIntersection}>
	<Chart>
		<Svg center>
			<Group y={16}>
				<LinearGradient
					id={gradientId}
					stops={[
						'var(--ax-text-success-decoration)',
						'var(--ax-text-warning-decoration)',
						'var(--ax-text-danger-decoration)'
					]}
				/>
				<Arc
					value={normalizedValue}
					domain={[0, domainMax]}
					range={[-120, 120]}
					outerRadius={70}
					innerRadius={56}
					cornerRadius={6}
					fill={`url(#${gradientId})`}
					track={{ fill: 'var(--ax-neutral-200)' }}
				/>
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
			{:else}
				<span>No data available</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.utilization-donut-wrapper {
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
		fill: var(--ax-text-neutral);
		font-size: var(--ax-font-size-large);
		font-weight: var(--ax-font-weight-semibold);
	}

	:global(.utilization-label) {
		fill: var(--ax-text-subtle);
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-regular);
	}
</style>
