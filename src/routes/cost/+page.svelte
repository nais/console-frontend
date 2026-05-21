<script lang="ts">
	import { page } from '$app/state';
	import { OrderDirection, TeamOrderField } from '$houdini';
	import LegendWrapper, { legendSnippet } from '$lib/chart/LegendWrapper.svelte';
	import { euroAxisFormatter, serviceColor } from '$lib/chart/util';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		BodyLong,
		Heading,
		Loader,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		ToggleGroup,
		ToggleGroupItem,
		Tr,
		type TableSortState
	} from '@nais/ds-svelte-community';
	import { PersonGroupIcon } from '@nais/ds-svelte-community/icons';
	import { sum } from 'd3-array';
	import { format } from 'date-fns';
	import { accessor, BarChart, findRelatedData, Tooltip } from 'layerchart';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TenantCost, CostMonthly, interval } = $derived(data);

	const currentOrderField = $derived(
		urlToOrderField(TeamOrderField, TeamOrderField.ACCUMULATED_COST, page.url)
	);

	const currentOrderDirection = $derived(urlToOrderDirection(page.url, OrderDirection.DESC));

	const tableSortState = $derived.by(
		(): TableSortState => ({
			orderBy: currentOrderField,
			direction: currentOrderDirection === OrderDirection.ASC ? 'ascending' : 'descending'
		})
	);

	const handleSortChange = (key: string) => {
		const nextDirection =
			currentOrderField === key
				? currentOrderDirection === OrderDirection.ASC
					? OrderDirection.DESC
					: OrderDirection.ASC
				: key === TeamOrderField.SLUG
					? OrderDirection.ASC
					: OrderDirection.DESC;

		changeParams(
			{
				sort: `${key}-${nextDirection}`,
				after: '',
				before: ''
			},
			{ noScroll: true }
		);
	};

	const allServicesSeries = $derived.by(() => {
		if (!$CostMonthly.data?.costMonthlySummary.series) return [];
		const mp = $CostMonthly.data.costMonthlySummary.series.reduce((acc, item) => {
			item.services.forEach((service) => {
				acc.set(service.service, service.cost);
			});
			return acc;
		}, new Map<string, number>());

		return Array.from(mp.keys())
			.sort((a, b) => {
				const aVal = mp.get(a) || 0;
				const bVal = mp.get(b) || 0;
				return bVal - aVal;
			})
			.reverse()
			.map((key) => ({
				key,
				color: serviceColor(key)
			}));
	});

	const tenantCostData = $derived.by(() => {
		if (!$CostMonthly.data?.costMonthlySummary?.series) return [];
		return $CostMonthly.data.costMonthlySummary.series.map((item) => ({
			date: item.date,
			...Object.fromEntries(item.services.map((s) => [s.service, s.cost]))
		}));
	});

	function formatDate(value: Date): string {
		if (!value) return '';
		return format(value, 'yyyy-MM-dd');
	}

	function sortedPayload(
		payload: { color?: string; name?: string; key: string; value?: number }[]
	) {
		return payload.toSorted((a, b) => {
			// Place items without value at the end
			if (!a.value) {
				return 1;
			}
			if (!b.value) {
				return -1;
			}
			return (b.value ?? 0) - (a.value ?? 0);
		});
	}
</script>

<div class="page">
	<div class="container">
		<Heading as="h1" size="large">Tenant Cost</Heading>
		<div class="wrapper">
			<!-- <GraphErrors errors={$TenantCost.errors} /> -->

			<section class="graph" aria-labelledby="cost-by-service-heading">
				<div class="heading">
					<div class="content">
						<Heading as="h2" spacing id="cost-by-service-heading">Cost by Service</Heading>
						<BodyLong>
							Service cost distribution for <strong>{page.data.tenantName?.toUpperCase()}</strong>.
							Some services are missing cost data. Figures are based on data from Google Cloud and
							Aiven. The current month includes data up to
							{#if $CostMonthly.data?.costMonthlySummary?.series && $CostMonthly.data.costMonthlySummary.series.length > 0 && $CostMonthly.data.costMonthlySummary.series.at(-1)?.date}
								<strong
									><Time
										time={$CostMonthly.data.costMonthlySummary.series.at(-1)?.date as Date}
									/></strong
								>
							{/if}.
						</BodyLong>
					</div>
					<ToggleGroup
						value={interval}
						onchange={(interval) => changeParams({ interval }, { noScroll: true })}
					>
						{#each ['5y', '3y', '1y', '6m'] as interval (interval)}
							<ToggleGroupItem value={interval}>{interval}</ToggleGroupItem>
						{/each}
					</ToggleGroup>
				</div>
				{#if $CostMonthly.data}
					<LegendWrapper height="1000px">
						<BarChart
							legend={legendSnippet}
							padding={{ top: 24, bottom: 24, left: 40, right: 40 }}
							data={tenantCostData}
							x="date"
							series={allServicesSeries}
							seriesLayout="stack"
							props={{
								xAxis: {
									format: formatDate
								},
								yAxis: { format: euroAxisFormatter }
							}}
						>
							{#snippet tooltip({ context })}
								<Tooltip.Root>
									{#snippet children({ data })}
										{@const visibleSeries = context.series.visibleSeries}
										{@const payload = context.tooltipState.series.map((s) => ({
											key: s.key,
											name: s.label ?? s.key,
											color: s.color,
											value: s.value
										}))}
										{@const total = sum(visibleSeries, (s) => {
											const seriesTooltipData = s.data
												? findRelatedData(s.data, data, context.x)
												: data;
											const valueAccessor = accessor(s.value ?? (s.data ? context.y : s.key));
											return valueAccessor(seriesTooltipData);
										})}
										<Tooltip.Header value={data.date} format={formatDate} />
										<Tooltip.List>
											{#each sortedPayload(payload) as p, i (p.key ?? i)}
												<Tooltip.Item label={p.name} color={p.color} valueAlign="right">
													{#if p.value && p.value > 0}
														{euroValueFormatter(p.value)}
														({((p.value / total) * 100).toFixed(1)}%)
													{:else}
														<span style="opacity:0.5;">{euroValueFormatter(0)}</span>
													{/if}
												</Tooltip.Item>
											{/each}
											{#if payload.length > 1}
												<Tooltip.Separator />
												<Tooltip.Item
													label="total"
													value={total}
													format="currency"
													valueAlign="right"
												/>
											{/if}
										</Tooltip.List>
									{/snippet}
								</Tooltip.Root>
							{/snippet}
						</BarChart>
					</LegendWrapper>
				{:else}
					<div class="loading-centered" role="status" aria-label="Loading">
						<Loader size="3xlarge" />
					</div>
				{/if}
			</section>
			<section aria-labelledby="team-cost-heading">
				<Heading as="h2" spacing id="team-cost-heading">Team Cost last 12 months</Heading>
				<BodyLong spacing>
					This table shows the cost for each team over the last 12 months. The cost is aggregated
					from all services used by the team.
				</BodyLong>

				<div class="table-scroll">
					<Table size="small" zebraStripes sort={tableSortState} onsortchange={handleSortChange}>
						<Thead>
							<Tr>
								<Th sortable sortKey={TeamOrderField.SLUG}>Team</Th>
								<Th sortable sortKey={TeamOrderField.ACCUMULATED_COST} align="right">
									Cost (12 months)
								</Th>
							</Tr>
						</Thead>
						<Tbody>
							{#if !$TenantCost.fetching}
								{#each $TenantCost.data?.teams.nodes ?? [] as team (team.slug)}
									<Tr>
										<Td>
											<IconLabel
												label={team.slug}
												href="/team/{team.slug}/cost"
												icon={PersonGroupIcon}
											/>
										</Td>
										<Td align="right">
											{euroValueFormatter(team.cost.monthlySummary.sum, {
												maximumFractionDigits: 0
											})}
										</Td>
									</Tr>
								{/each}
							{:else}
								<Tr>
									<Td colspan={2}>
										<div class="loading-centered" role="status" aria-label="Loading">
											<Loader size="3xlarge" />
										</div>
									</Td>
								</Tr>
							{/if}
						</Tbody>
					</Table>
				</div>
				<Pagination
					page={$TenantCost.data?.teams.pageInfo}
					fetching={$TenantCost.fetching}
					loaders={{
						loadPreviousPage: () =>
							changeParams(
								{
									after: '',
									before: $TenantCost.data?.teams.pageInfo.startCursor ?? ''
								},
								{ noScroll: true }
							),
						loadNextPage: () =>
							changeParams(
								{
									after: $TenantCost.data?.teams.pageInfo.endCursor ?? '',
									before: ''
								},
								{ noScroll: true }
							)
					}}
				/>
			</section>
		</div>
	</div>
</div>

<style>
	.container {
		margin-top: var(--spacing-layout);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	section.graph {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}

	.heading {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--spacing-layout);
		padding-bottom: var(--spacing-layout);
	}

	.content {
		max-width: 80ch;
	}

	/* Mobile responsive styles */
	@media (max-width: 767px) {
		.heading {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--ax-space-16);
		}

		.content {
			max-width: 100%;
		}
	}
</style>
