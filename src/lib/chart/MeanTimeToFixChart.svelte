<script lang="ts" module>
	export type MeanTimeToFixHistory =
		| {
		samples: {
			severity: string; // e.g., 'HIGH', 'MEDIUM', 'LOW', 'CRITICAL', 'UNASSIGNED'
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
	import type { intervalOptionsVulnerabilityHistory } from '$lib/components/vulnerability/dateUtils';
	import { isReducedMotion } from '$lib/reducedMotion';
	import { severityToColor, type Severity } from '$lib/utils/vulnerabilities';
	import { format } from 'date-fns';
	import { accessor, AreaChart, Tooltip, type SeriesData } from 'layerchart';
	import { SvelteDate } from 'svelte/reactivity';
	import LegendWrapper, { legendSnippet } from './LegendWrapper.svelte';

	const UPPERCASE_SEVERITIES = ['HIGH', 'MEDIUM', 'LOW'] as const;

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
		[key: string]: number | Date;
	};

	function transformLayerchartMTTFix(data: MeanTimeToFixHistory): {
		data: MTTFixChartData[];
		series: { key: string; color: string }[];
	} {
		if (!data || !data.samples.length) return { data: [], series: [] };

		// Merge samples by date
		const mergedDataMap = new Map<number, MTTFixChartData>();

		for (const sample of data.samples) {
			if (!UPPERCASE_SEVERITIES.includes(sample.severity.toUpperCase() as any)) continue;

			const dateKey = new SvelteDate(sample.date).setHours(0, 0, 0, 0);
			const entry = mergedDataMap.get(dateKey) ?? { date: new Date(dateKey) };

			entry[sample.severity.toUpperCase()] = sample.days ?? 0;
			entry[`fixedCount_${sample.severity.toUpperCase()}`] = sample.fixedCount ?? 0;
			entry[`lastFixedAt_${sample.severity.toUpperCase()}`] = sample.lastFixedAt ?? null;
			entry[`firstFixedAt_${sample.severity.toUpperCase()}`] = sample.firstFixedAt ?? null;

			mergedDataMap.set(dateKey, entry);
		}

		const series = UPPERCASE_SEVERITIES.map((severity) => ({
			key: severity,
			color: severityToColor({ severity: severity.toLowerCase() })
		}));

		return { data: Array.from(mergedDataMap.values()), series };
	}

	const chartData = $derived.by(() => transformLayerchartMTTFix(data));
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
					interval === '6m'
						? 'month'
						: (value: Date) => (value ? format(value, 'dd/MM') : ''),
				tickSpacing: 150
			}
		}}
	>
		{#snippet tooltip({ series, context })}
			<Tooltip.Root>
				{#snippet children({ data })}
					<Tooltip.Header>{format(context.x(data), 'dd/MM/yyyy')}</Tooltip.Header>
					<Tooltip.List>
						{#each UPPERCASE_SEVERITIES as severityKey (severityKey)}
							{@const seriesItem = series.find((s) => s.key === severityKey)}
							{@const valueAccessor = accessor(severityKey)}
							<Tooltip.Item label={severityKey} color={seriesItem?.color}>
								{valueAccessor(data)?.toFixed(1) ?? 0} days
							</Tooltip.Item>
							<Tooltip.Item label="Fixed count">
								{data[`fixedCount_${severityKey}`] ?? 0}
							</Tooltip.Item>
							<Tooltip.Item label="Last fixed at">
								{data[`lastFixedAt_${severityKey}`]
									? format(new Date(data[`lastFixedAt_${severityKey}`] as Date), 'dd/MM/yyyy')
									: '-'}
							</Tooltip.Item>
						{/each}
					</Tooltip.List>
				{/snippet}
			</Tooltip.Root>
		{/snippet}
	</AreaChart>
</LegendWrapper>
