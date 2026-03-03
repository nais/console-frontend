<script lang="ts">
	import { getSegmentFill } from '$lib/chart/util';
	import { Arc, Chart, Group, Svg, Text } from 'layerchart';

	type StaticUtilizationDonutProps = {
		value: number | null | undefined;
		label?: string;
		height?: `${number}px`;
		domainMax?: number;
		showLabel?: boolean;
		formatCenterValue?: (value: number) => string;
	};

	let {
		value,
		label = 'Utilization',
		height = '170px',
		domainMax = 100,
		showLabel = true,
		formatCenterValue = (currentValue: number) => `${currentValue.toFixed(1)}%`
	}: StaticUtilizationDonutProps = $props();

	const segmentCount = 36;
	// Helper array of segment numbers [0, segmentCount - 1] used for rendering donut segments
	const segmentIndices = Array.from({ length: segmentCount }, (_, index) => index);
	const segmentRangeStart = -120;
	const segmentRangeEnd = 120;
	const segmentPadAngle = 0.03;

	const hasData = $derived(value !== null && value !== undefined && Number.isFinite(value));

	const normalizedValue = $derived.by(() => {
		if (!hasData) {
			return 0;
		}

		const safeDomainMax = domainMax > 0 ? domainMax : 1;
		const safeValue = value ?? 0;

		if (safeValue < 0) {
			return 0;
		}

		if (safeValue > safeDomainMax) {
			return safeDomainMax;
		}

		return safeValue;
	});

	const activeSegments = $derived.by(() => {
		if (domainMax <= 0) {
			return 0;
		}

		const ratio = Math.max(0, Math.min(1, normalizedValue / domainMax));
		return Math.round(ratio * segmentCount);
	});
</script>

<div class="utilization-segmented-chart" style="height: {height};">
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
						fill={getSegmentFill(segmentIndex, segmentIndex < activeSegments, segmentCount)}
					/>
				{/each}
			</Group>
			{#if hasData}
				<Text
					value={formatCenterValue(normalizedValue)}
					textAnchor="middle"
					verticalAnchor="middle"
					class="utilization-value"
					dy={showLabel ? 2 : 14}
				/>
			{:else}
				<Text
					value="No data"
					textAnchor="middle"
					verticalAnchor="middle"
					class="utilization-value utilization-value--empty"
					dy={showLabel ? 2 : 14}
				/>
			{/if}
			{#if showLabel}
				<Text
					value={label}
					textAnchor="middle"
					verticalAnchor="middle"
					class="utilization-label"
					dy={26}
				/>
			{/if}
		</Svg>
	</Chart>
</div>

<style>
	.utilization-segmented-chart {
		position: relative;
		width: 100%;
	}

	:global(.utilization-value) {
		font-size: var(--ax-font-size-large);
		font-weight: var(--ax-font-weight-bold);
	}

	:global(.utilization-value--empty) {
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-regular);
	}

	:global(.utilization-label) {
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-regular);
	}
</style>
