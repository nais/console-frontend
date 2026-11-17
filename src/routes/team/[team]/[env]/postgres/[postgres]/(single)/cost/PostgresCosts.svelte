<script lang="ts">
	import type { PostgresCosts$result } from '$houdini';
	import ChartBoundary from '#lib/chart/ChartBoundary.svelte';
	import CostAreaChart from '#lib/chart/CostAreaChart.svelte';
	import type { CostInterval } from '#lib/domain/cost/dateUtils.js';
	import {
		Accordion,
		AccordionItem,
		BodyShort,
		Heading,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		ToggleGroup,
		ToggleGroupItem,
		Tr
	} from '#lib/shadcn/ui/index.js';
	import { euroValueFormatter } from '#lib/utils/formatters.js';
	import { changeParams } from '#lib/utils/searchparams.js';

	let {
		cost,
		interval,
		from,
		to
	}: {
		cost: NonNullable<PostgresCosts$result['team']['environment']['postgres']>['cost'];
		interval: CostInterval;
		from: Date;
		to: Date;
	} = $props();

	const uid = $props.id();
	const dateLabel = (date: Date) =>
		date.toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			timeZone: 'UTC'
		});
	let dailyData = $derived(
		cost.daily?.series.map((item) => ({
			date: item.date,
			...Object.fromEntries(item.services.map((service) => [service.service, service.cost]))
		})) ?? []
	);
	let monthlyData = $derived(
		[...(cost.monthly?.series ?? [])]
			.sort((a, b) => a.date.getTime() - b.date.getTime())
			.map((item) => ({ date: item.date, Total: item.sum }))
	);
</script>

<section aria-labelledby="{uid}-heading">
	<Heading as="h2" id="{uid}-heading" size="medium" spacing>Cost</Heading>
	<BodyShort>
		Actual billed costs in EUR, delayed by at least two days. Missing dates are omitted, not zero.
		Monthly totals may be incomplete.
	</BodyShort>
	<div class="section-header">
		<Heading as="h3" id="{uid}-daily" size="small">Daily costs</Heading>
		<ToggleGroup
			size="small"
			label="Cost period"
			value={interval}
			onchange={(value) => {
				if (value) void changeParams({ interval: value }, { noScroll: true });
			}}
		>
			{#each ['30d', '90d', '6m', '1y'] as value (value)}
				<ToggleGroupItem {value}>{value}</ToggleGroupItem>
			{/each}
		</ToggleGroup>
	</div>
	<BodyShort>{dateLabel(from)} – {dateLabel(to)}</BodyShort>
	{#if cost.daily}
		<BodyShort>Total: <strong>{euroValueFormatter(cost.daily.sum)}</strong></BodyShort>
		{#if dailyData.length > 0}
			<ChartBoundary fillHeight={false}>
				<CostAreaChart data={dailyData} />
			</ChartBoundary>
			<Accordion size="small">
				<AccordionItem>
					{#snippet heading()}Daily cost data{/snippet}
					<div class="table-scroll">
						<Table size="small" aria-labelledby="{uid}-daily">
							<Thead><Tr><Th scope="col">Date</Th><Th scope="col">Cost (EUR)</Th></Tr></Thead>
							<Tbody>
								{#each cost.daily.series as item (item.date.getTime())}
									<Tr
										><Th scope="row">{dateLabel(item.date)}</Th><Td
											>{euroValueFormatter(item.sum)}</Td
										></Tr
									>
								{/each}
							</Tbody>
						</Table>
					</div>
				</AccordionItem>
			</Accordion>
		{:else}
			<BodyShort>No daily cost data available for this period.</BodyShort>
		{/if}
	{:else}
		<BodyShort>No daily cost data available for this period.</BodyShort>
	{/if}

	<div class="section-header">
		<Heading as="h3" id="{uid}-monthly" size="small">Last 12 months</Heading>
	</div>
	{#if cost.monthly}
		<BodyShort>Total: <strong>{euroValueFormatter(cost.monthly.sum)}</strong></BodyShort>
		{#if monthlyData.length > 0}
			<ChartBoundary fillHeight={false}>
				<CostAreaChart data={monthlyData} period="month" />
			</ChartBoundary>
			<Accordion size="small">
				<AccordionItem>
					{#snippet heading()}Monthly cost data{/snippet}
					<div class="table-scroll">
						<Table size="small" aria-labelledby="{uid}-monthly">
							<Thead
								><Tr
									><Th scope="col">Month</Th><Th scope="col">Data through</Th><Th scope="col"
										>Cost (EUR)</Th
									></Tr
								></Thead
							>
							<Tbody>
								{#each monthlyData as item (item.date.getTime())}
									<Tr>
										<Th scope="row"
											>{item.date.toLocaleDateString('en-GB', {
												month: 'long',
												year: 'numeric',
												timeZone: 'UTC'
											})}</Th
										>
										<Td>{dateLabel(item.date)}</Td>
										<Td>{euroValueFormatter(item.Total)}</Td>
									</Tr>
								{/each}
							</Tbody>
						</Table>
					</div>
				</AccordionItem>
			</Accordion>
		{:else}
			<BodyShort>No monthly cost data available.</BodyShort>
		{/if}
	{:else}
		<BodyShort>No monthly cost data available.</BodyShort>
	{/if}
</section>

<style>
	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--nais-space-8);
		margin-block: var(--nais-space-24) var(--nais-space-12);
	}
</style>
