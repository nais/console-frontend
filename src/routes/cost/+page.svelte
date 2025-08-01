<script lang="ts">
	import { page } from '$app/state';
	import { TeamOrderField } from '$houdini';
	import { euroAxisFormatter, serviceColor } from '$lib/chart/util';
	import IconLabel from '$lib/components/IconLabel.svelte';
	import List from '$lib/components/list/List.svelte';
	import ListItem from '$lib/components/list/ListItem.svelte';
	import OrderByMenu from '$lib/components/OrderByMenu.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		BodyLong,
		BodyShort,
		Heading,
		Loader,
		ToggleGroup,
		ToggleGroupItem
	} from '@nais/ds-svelte-community';
	import { PersonGroupIcon } from '@nais/ds-svelte-community/icons';
	import { sum } from 'd3-array';
	import { format } from 'date-fns';
	import { accessor, BarChart, findRelatedData, Tooltip } from 'layerchart';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TenantCost, CostMonthly, interval } = $derived(data);

	let tableSort = $derived({
		orderBy: $TenantCost.variables?.orderBy?.field,
		direction: $TenantCost.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = TeamOrderField[key as keyof typeof TeamOrderField];
			tableSort.direction = 'DESC';
		}

		changeParams(
			{
				direction: tableSort.direction,
				field: tableSort.orderBy || TeamOrderField.SLUG,
				after: '',
				before: ''
			},
			{ noScroll: true }
		);
	};

	const allServicesSeries = $derived.by(() => {
		if (!$TenantCost.data?.costMonthlySummary?.series) return [];
		const mp = $TenantCost.data.costMonthlySummary.series.reduce((acc, item) => {
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
		if (!$TenantCost.data?.costMonthlySummary?.series) return [];
		return $TenantCost.data.costMonthlySummary.series.map((item) => ({
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

<svelte:head><title>Tenant Cost - Nais Console</title></svelte:head>
<div class="page">
	<div class="container">
		<div class="wrapper">
			<!-- <GraphErrors errors={$TenantCost.errors} /> -->

			<div class="graph">
				<div class="heading">
					<div class="content">
						<Heading level="2" spacing>Cost by Service</Heading>
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
				{#if $TenantCost.data}
					<div class="h-[1000px]">
						<BarChart
							legend={{
								placement: 'top',

								classes: {
									root: 'mb-2'
								}
							}}
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
							{#snippet tooltip({ context, visibleSeries })}
								<Tooltip.Root>
									{#snippet children({ data, payload })}
										{@const total = sum(visibleSeries, (s) => {
											const seriesTooltipData = s.data
												? findRelatedData(s.data, data, context.x)
												: data;
											const valueAccessor = accessor(s.value ?? (s.data ? context.y : s.key));
											return valueAccessor(seriesTooltipData);
										})}
										<Tooltip.Header value={payload[0].label} format={formatDate} />
										<Tooltip.List>
											{#each sortedPayload(payload) as p, i (p.key ?? i)}
												<Tooltip.Item label={p.name} color={p.color} valueAlign="right">
													{#if p.value && p.value > 0}
														{euroValueFormatter(p.value)}
														({((p.value / total) * 100).toFixed(1)}%)
													{:else}
														<span style="opacity:0.5;">${euroValueFormatter(0)}</span>
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
					</div>
				{:else}
					<div style="display: flex; justify-content: center; align-items: center; height: 500px;">
						<Loader size="3xlarge" />
					</div>
				{/if}
			</div>
			<div>
				<Heading level="3" spacing>Team Cost last 12 months</Heading>
				<BodyLong spacing>
					This table shows the monthly cost for each team over the last 12 months. The cost is
					aggregated from all services used by the team.
				</BodyLong>

				<List title="Team Cost Breakdown">
					{#snippet menu()}
						<OrderByMenu
							orderField={TeamOrderField}
							defaultOrderField={TeamOrderField.ACCUMULATED_COST}
							onlyInclude={[TeamOrderField.SLUG, TeamOrderField.ACCUMULATED_COST]}
						/>
					{/snippet}
					{#if !$TenantCost.fetching}
						{#each $TenantCost.data?.teams.nodes ?? [] as team (team.slug)}
							<ListItem>
								<IconLabel
									label={team.slug}
									href="/team/{team.slug}/cost"
									icon={PersonGroupIcon}
									size="large"
									level="3"
								/>
								<div class="right">
									<BodyShort
										>{euroValueFormatter(team.cost.monthlySummary.sum, {
											maximumFractionDigits: 0
										})}</BodyShort
									>
								</div>
							</ListItem>
						{/each}
					{:else}
						<div
							style="display: flex; justify-content: center; align-items: center; height: 200px;"
						>
							<Loader size="3xlarge" />
						</div>
					{/if}
				</List>
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
			</div>
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

	.graph {
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
	.right {
		display: flex;
		flex-direction: row;
		align-items: end;
		gap: var(--ax-space-24);
	}
</style>
