<script lang="ts" module>
	export function getEstimateForMonth(cost: number, date: Date) {
		const daysKnown = date.getDate();
		const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		const costPerDay = cost / daysKnown;
		return costPerDay * daysInMonth;
	}

	const minScale = 1; // EUR
</script>

<script lang="ts" generics="T">
	import { euroValueFormatter } from '$lib/utils/formatters';

	import { Highlight, LineChart, Tooltip } from 'layerchart';
	import { euroAxisFormatter } from './util';

	let {
		data,
		dateField,
		valueField,
		class: klass,
		color
	}: {
		data: T[];
		height?: number;
		dateField: keyof T;
		valueField: keyof T;
		color?: string;
		class?: string;
	} = $props();

	const daily = $derived.by(() => {
		if (data.length < 2) return false;

		const firstDate = data[0][dateField] as Date;
		const secondDate = data[1][dateField] as Date;

		if (
			firstDate.getFullYear() === secondDate.getFullYear() &&
			firstDate.getMonth() === secondDate.getMonth() &&
			secondDate.getDate() - firstDate.getDate() === 1
		) {
			return true;
		}
		return false;
	});
	const chartData = $derived.by(() => {
		return (
			data?.map((item, i) => {
				return {
					date: item[dateField] as Date,
					value:
						i == 0 && !daily
							? getEstimateForMonth(item[valueField] as number, item[dateField] as Date)
							: item[valueField] // The first item might be incomplete, so we estimate it
				};
			}) ?? []
		);
	});

	const maxValue = $derived.by(() =>
		chartData.reduce((max, item) => {
			const v = item.value as number;
			return v > max ? v : max;
		}, -Infinity)
	);
</script>

{#if chartData.length > 0}
	<div class={klass}>
		<LineChart
			data={chartData}
			x="date"
			y="value"
			yDomain={[null, maxValue > minScale ? null : minScale]}
			series={color
				? [
						{
							key: 'value',
							color: color
						}
					]
				: undefined}
			props={{
				spline: {
					class: 'stroke-2'
				},
				yAxis: {
					format: euroAxisFormatter
				},
				xAxis: {
					format(value: Date) {
						if (!value) return '';
						// eslint-disable-next-line svelte/prefer-svelte-reactivity
						const date = new Date(value);
						date.setMonth(value.getMonth() - 1); // Set to the first of the month for display
						return date.toLocaleString('en-GB', { month: 'short' });
					}
				}
			}}
		>
			{#snippet highlight({ visibleSeries, getHighlightProps })}
				<!-- Disable motion for highlight points -->
				{#each visibleSeries as s, i (s.key)}
					<Highlight {...getHighlightProps(s, i)} motion="none" />
				{/each}
			{/snippet}
			{#snippet tooltip()}
				<!-- More suitable single-value tooltip -->
				<Tooltip.Root>
					{#snippet children({ data })}
						<Tooltip.List>
							<Tooltip.Item
								label={data.date.toLocaleString('en-GB', {
									month: 'long',
									day: daily ? 'numeric' : undefined
								})}
								value={euroValueFormatter(data.value)}
							/>
						</Tooltip.List>
					{/snippet}
				</Tooltip.Root>
			{/snippet}
		</LineChart>
	</div>
{/if}
