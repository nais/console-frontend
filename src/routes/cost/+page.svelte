<script lang="ts">
	import { page } from '$app/state';
	import { type TenantCost$result } from '$houdini';
	import EChart from '$lib/chart/EChart.svelte';
	import Time from '$lib/Time.svelte';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		BodyLong,
		Heading,
		Loader,
		ToggleGroup,
		ToggleGroupItem
	} from '@nais/ds-svelte-community';
	import { type EChartsOption } from 'echarts';
	import type { OptionDataValue } from 'echarts/types/src/util/types.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TenantCost, interval } = $derived(data);

	function costTransformStackedColumnChart(data: TenantCost$result | undefined): EChartsOption {
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
			} as EChartsOption;
		}

		const seriesData: { [service: string]: [string, number][] } = {};
		const allServices = new Set<string>();

		// First pass to collect all service names
		data.costMonthlySummary.series.forEach((entry) => {
			entry.services.forEach((service) => {
				allServices.add(service.service);
			});
		});

		// Second pass to build the series data
		data.costMonthlySummary.series.forEach((entry) => {
			const entryDate = new Date(entry.date);
			const label = entryDate.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			});

			if (entry.services.length === 0) {
				allServices.forEach((service) => {
					if (!seriesData[service]) {
						seriesData[service] = [];
					}
					seriesData[service].push([label, 0]);
				});
			} else {
				entry.services.forEach((service) => {
					if (!seriesData[service.service]) {
						seriesData[service.service] = [];
					}
					seriesData[service.service].push([label, service.cost]);
				});

				allServices.forEach((service) => {
					if (!entry.services.some((s) => s.service === service)) {
						if (!seriesData[service]) {
							seriesData[service] = [];
						}
						seriesData[service].push([label, 0]);
					}
				});
			}
		});

		const series = Array.from(allServices)
			.map((serviceName) => ({
				name: serviceName,
				type: 'bar',
				stack: 'Cost',
				showSymbol: true,
				data: seriesData[serviceName]
			}))
			.toSorted((a, b) => a.name.localeCompare(b.name));

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
				axisPointer: {
					type: 'cross'
				},
				valueFormatter(value: OptionDataValue[]) {
					return euroValueFormatter(value[1] as number);
				}
			},
			legend: {
				selector: [{ title: 'Inverse selection', type: 'inverse' }],
				data: Array.from(allServices).toSorted((a, b) => a.localeCompare(b))
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			xAxis: [
				{
					type: 'category'
				}
			],
			yAxis: [
				{
					type: 'value',
					axisLabel: {
						formatter: (value: number) =>
							value.toLocaleString('en', {
								style: 'currency',
								currency: 'EUR',
								minimumSignificantDigits: 1,
								roundingPriority: 'morePrecision'
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
							{#if $TenantCost.data?.costMonthlySummary?.series && $TenantCost.data.costMonthlySummary.series.length > 0 && $TenantCost.data.costMonthlySummary.series.at(-1)?.date}
								<strong
									><Time
										time={$TenantCost.data.costMonthlySummary.series.at(-1)?.date as Date}
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
					<!-- <EChart options={costTransformStackedLineChart($TenantCost.data)} /> -->
					<EChart
						options={costTransformStackedColumnChart($TenantCost.data)}
						style="height: 1000px;"
					/>
				{:else}
					<div style="display: flex; justify-content: center; align-items: center; height: 500px;">
						<Loader size="3xlarge" />
					</div>
				{/if}
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
</style>
