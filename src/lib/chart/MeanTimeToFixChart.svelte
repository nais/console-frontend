<script lang="ts" module>
	export type MeanTimeToFixHistory =
		| {
				samples: {
					severity: string;
					date: Date;
					days: number;
					fixedCount: number;
					firstFixedAt: Date | null;
					lastFixedAt: Date | null;
				}[];
		  }
		| undefined
		| null;
</script>

<script lang="ts" generics="T extends MeanTimeToFixHistory">
	import type { intervalOptionsVulnerabilityHistory } from '$lib/domain/vulnerability/dateUtils';
	import { isReducedMotion } from '$lib/reducedMotion';
	import { allSeverities, severityToColor, type Severity } from '$lib/utils/vulnerabilities';
	import { format } from 'date-fns';
	import { accessor, AreaChart, Tooltip } from 'layerchart';
	import { SvelteDate, SvelteMap } from 'svelte/reactivity';
	import LegendWrapper, { legendSnippet } from './LegendWrapper.svelte';

	// Reverse order for stacked area chart so Critical appears on top
	const severitiesForChart = [...allSeverities].reverse();

	const {
		data,
		interval = '7d',
		height = '300px'
	}: {
		data: T;
		interval?: (typeof intervalOptionsVulnerabilityHistory)[number];
		height?: `${number}px`;
	} = $props();

	type MTTFixChartData = {
		date: Date;
		[key: string]: number | Date | null;
	};

	function transformLayerchartMTTFix(data: MeanTimeToFixHistory): {
		data: MTTFixChartData[];
		series: { key: string; color: string }[];
	} {
		if (!data || !data.samples.length) return { data: [], series: [] };

		const mergedDataMap = new SvelteMap<number, MTTFixChartData>();

		for (const sample of data.samples) {
			// Normalize severity from GraphQL (e.g., "CRITICAL" -> "Critical")
			const severityLower = sample.severity.toLowerCase();
			const severity = (severityLower.charAt(0).toUpperCase() + severityLower.slice(1)) as Severity;
			if (!allSeverities.includes(severity)) continue;

			const dateKey = new SvelteDate(sample.date).setHours(0, 0, 0, 0);
			const entry = mergedDataMap.get(dateKey) ?? { date: new Date(dateKey) };

			entry[severity] = sample.days ?? 0;
			entry[`fixedCount_${severity}`] = sample.fixedCount ?? 0;
			entry[`lastFixedAt_${severity}`] = sample.lastFixedAt;
			entry[`firstFixedAt_${severity}`] = sample.firstFixedAt;

			mergedDataMap.set(dateKey, entry);
		}

		const series = severitiesForChart.map((severity) => ({
			key: severity,
			color: severityToColor({ severity: severity.toLowerCase() })
		}));

		return { data: Array.from(mergedDataMap.values()), series };
	}

	const chartData = $derived.by(() => transformLayerchartMTTFix(data));

	function formatLastFixedAt(value: unknown): string {
		return value instanceof Date ? format(value, 'dd/MM/yyyy') : '-';
	}

	function formatDays(value: number | undefined): string {
		if (value == null) return '0';
		return Number.isInteger(value) ? value.toString() : value.toFixed(1);
	}
</script>

<LegendWrapper {height}>
	<AreaChart
		yNice
		padding={{ top: 24, bottom: 24, left: 40, right: 40 }}
		data={chartData.data}
		series={chartData.series}
		seriesLayout="stack"
		x="date"
		legend={legendSnippet}
		props={{
			area: { fillOpacity: 0.8, class: 'pl-4', motion: isReducedMotion ? 'none' : 'tween' },
			yAxis: { label: 'Days to fix', labelPlacement: 'start' },
			xAxis: {
				motion: isReducedMotion ? 'none' : 'tween',
				format:
					interval === '6m' ? 'month' : (value: Date) => (value ? format(value, 'dd/MM') : ''),
				tickSpacing: 150
			}
		}}
	>
		{#snippet tooltip({ series, context })}
			<Tooltip.Root>
				{#snippet children({ data })}
					<Tooltip.Header>{format(context.x(data), 'dd/MM/yyyy')}</Tooltip.Header>
					<Tooltip.List>
						{#each severitiesForChart as severityKey (severityKey)}
							{@const seriesItem = series.find((s) => s.key === severityKey)}
							{@const valueAccessor = accessor(severityKey)}
							<Tooltip.Item label={severityKey} color={seriesItem?.color}>
								{formatDays(valueAccessor(data))} days
							</Tooltip.Item>
							<Tooltip.Item label="Fixed count">
								{data[`fixedCount_${severityKey}`] ?? 0}
							</Tooltip.Item>
							{@const lastFixedAt = data[`lastFixedAt_${severityKey}`]}
							<Tooltip.Item label="Last fixed at">
								{formatLastFixedAt(lastFixedAt)}
							</Tooltip.Item>
						{/each}
					</Tooltip.List>
				{/snippet}
			</Tooltip.Root>
		{/snippet}
	</AreaChart>
</LegendWrapper>
