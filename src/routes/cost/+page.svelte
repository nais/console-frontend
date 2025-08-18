<script lang="ts">
	import { page } from '$app/state';
	import { TeamOrderField, type CostMonthly$result } from '$houdini';
	import EChart from '$lib/chart/EChart.svelte';
	import { normalizeVal } from '$lib/chart/transformVulnerabilities';
	import { serviceColor } from '$lib/chart/util';
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
	import { format } from 'date-fns';
	import { type EChartsOption } from 'echarts';
	import type { CallbackDataParams } from 'echarts/types/src/util/types.js';
	import { SvelteSet } from 'svelte/reactivity';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TenantCost, CostMonthly, interval } = $derived(data);

	function costTransformStackedColumnChart(data: CostMonthly$result | undefined): EChartsOption {
		if (!data) {
			return {
				animation: false,
				title: {
					text: 'No data',
					left: 'center',
					top: 'center',
					textStyle: {
						color: '#aaa'
					}
				}
			};
		}

		const seriesData: Record<string, [string, number][]> = {};
		const allServices = new SvelteSet<string>();
		const allLabels: string[] = [];

		// Collect all unique service names
		data.costMonthlySummary.series.forEach((entry) => {
			entry.services.forEach((service) => {
				allServices.add(service.service);
			});
		});

		const serviceList = Array.from(allServices);

		// Initialize data containers for all services
		serviceList.forEach((service) => {
			seriesData[service] = [];
		});

		// Populate series data
		data.costMonthlySummary.series.forEach((entry) => {
			const label = format(new Date(entry.date), 'yyyy-MM-dd');
			allLabels.push(label);

			const costMap = new Map<string, number>(entry.services.map((s) => [s.service, s.cost]));

			serviceList.forEach((service) => {
				const cost = costMap.get(service) ?? 0;
				seriesData[service].push([label, cost]);
			});
		});

		// Sort by latest cost descending
		const sortedServices = [...serviceList].sort((a, b) => {
			const aVal = seriesData[a].at(-1)?.[1] ?? 0;
			const bVal = seriesData[b].at(-1)?.[1] ?? 0;
			return bVal - aVal;
		});

		// Reverse for stacked bar (last = bottom)
		const series = [...sortedServices].reverse().map((serviceName) => ({
			name: serviceName,
			color: serviceColor(serviceName),
			type: 'bar',
			stack: 'Cost',
			data: seriesData[serviceName]
		}));

		return {
			animation: false,
			height: '850px',
			width: '1250px',
			title:
				series.length === 0
					? {
							text: 'No data',
							left: 'center',
							top: 'center',
							textStyle: {
								color: '#aaa'
							}
						}
					: {},
			tooltip: {
				trigger: 'axis',
				formatter: (params: CallbackDataParams[]) => {
					if (!params.length) return '';

					const valueList = [...params].sort((a, b) => {
						const aVal = normalizeVal((a.value as [string, number | string])[1]);
						const bVal = normalizeVal((b.value as [string, number | string])[1]);
						return bVal - aVal;
					});

					const rawDate = (valueList[0].value as [string, number])[0];
					const parsedDate = new Date(rawDate);
					const date = format(parsedDate, 'dd/MM/yyyy');

					let total = 0;
					const rows = valueList
						.map((v) => {
							const valRaw = (v.value as [string, number | string])[1];
							const val = normalizeVal(valRaw);
							total += val;
							return { val, html: v };
						})
						.map(({ val, html: v }) => {
							const percent = total > 0 ? ` (${((val / total) * 100).toFixed(1)}%)` : '';
							const valueHtml = `<div style="text-align:right;">${
								val === 0
									? `<span style="opacity:0.5;">${euroValueFormatter(val)}</span>`
									: `${euroValueFormatter(val)}${percent}`
							}</div>`;

							return `<div style="display:flex;align-items:center;gap:0.25rem;">
						<div style="height:8px;width:8px;border-radius:50%;background:${v.color};"></div>
						${v.seriesName}
					</div>${valueHtml}`;
						})
						.join('');

					return `<div>${date}</div>
					<div style="font-weight:bold;margin:0.25rem 0;">Total cost: ${euroValueFormatter(total)}</div>
					<hr/>
					<div style="display:grid;grid-template-columns:auto auto;gap:0.5rem;">${rows}</div>`;
				}
			},
			legend: {
				top: 0,
				left: 'center',
				orient: 'horizontal',
				selector: [{ title: 'Inverse selection', type: 'inverse' }],
				data: sortedServices
			},
			grid: {
				left: 80,
				right: 20,
				bottom: 40,
				top: 100,
				containLabel: true
			},
			xAxis: [
				{
					type: 'category',
					name: 'Date',
					data: allLabels
				}
			],
			yAxis: [
				{
					type: 'value',
					name: 'Cost (€)',
					nameLocation: 'middle',
					nameGap: 20,
					axisLabel: {
						formatter: (value: number) =>
							value.toLocaleString('en', {
								style: 'currency',
								currency: 'EUR',
								minimumSignificantDigits: 1
							})
					}
				}
			],
			series
		} as EChartsOption;
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
				{#if $CostMonthly.data}
					<EChart
						options={costTransformStackedColumnChart($CostMonthly.data)}
						style="height: 1000px;"
					/>
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
