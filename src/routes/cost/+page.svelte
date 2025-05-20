<script lang="ts">
	import { type TenantCost$result } from '$houdini';
	import { euroValueFormatter } from '$lib/chart/cost_transformer';
	import EChart from '$lib/chart/EChart.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		BodyLong,
		Heading,
		Loader,
		ToggleGroup,
		ToggleGroupItem
	} from '@nais/ds-svelte-community';
	import type { EChartsOption } from 'echarts';
	import type { OptionDataValue } from 'echarts/types/src/util/types.js';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { TenantCost, interval } = $derived(data);

	export function costTransformStackedColumnChart(
		data: TenantCost$result | undefined
	): EChartsOption {
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

		const dates: string[] = [];
		const seriesData: { [service: string]: [number, number][] } = {};
		const allServices = new Set<string>();

		data.costMonthlySummary.series.forEach((entry) => {
			entry.services.forEach((service) => {
				allServices.add(service.service);
			});
		});

		// Second pass to build the series data
		data.costMonthlySummary.series.forEach((entry) => {
			const entryDate = new Date(entry.date);

			dates.push(entryDate.toISOString().split('T')[0]); // Format date as YYYY-MM-DD

			if (entry.services.length === 0) {
				// No services for this day, add 0 for all services
				allServices.forEach((service) => {
					if (!seriesData[service]) {
						seriesData[service] = [];
					}
					seriesData[service].push([entryDate.getTime(), 0]);
				});
			} else {
				// Process each service for this day
				entry.services.forEach((service) => {
					if (!seriesData[service.service]) {
						seriesData[service.service] = [];
					}
					seriesData[service.service].push([entryDate.getTime(), service.cost]);
				});

				// Add 0 for missing services on this day
				allServices.forEach((service) => {
					if (!entry.services.some((s) => s.service === service)) {
						if (!seriesData[service]) {
							seriesData[service] = [];
						}
						seriesData[service].push([entryDate.getTime(), 0]);
					}
				});
			}
		});

		// Prepare the series for ECharts
		const series = Array.from(allServices).map((serviceName) => ({
			name: serviceName,
			type: 'line',
			stack: 'Cost',
			areaStyle: {
				opacity: 1
			},
			showSymbol: false,
			data: seriesData[serviceName]
		}));

		return {
			animation: false,
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
					type: 'shadow'
				},
				valueFormatter(value: OptionDataValue[]) {
					return euroValueFormatter(value[1] as number);
				}
			},
			legend: {
				selector: [{ title: 'Inverse selection', type: 'inverse' }],
				data: Array.from(allServices)
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			xAxis: [
				{
					type: 'time',
					boundaryGap: false
				}
			],
			yAxis: [
				{
					type: 'value',
					axisLabel: {
						formatter: (value: number) => euroValueFormatter(value)
					}
				}
			],
			series
		} as EChartsOption;
	}
</script>

<div class="wrapper">
	<GraphErrors errors={$TenantCost.errors} />

	<div class="graph">
		<div class="heading">
			<div class="content">
				<Heading level="2" spacing>Cost by Service</Heading>
				<BodyLong>
					Distribution of team costs across various services. Some services, like Kafka, are missing
					cost data per team. Cost information is best-effort and originates from Google Cloud and
					Aiven.
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
			<EChart options={costTransformStackedColumnChart($TenantCost.data)} style="height: 500px" />
		{:else}
			<div style="display: flex; justify-content: center; align-items: center; height: 500px;">
				<Loader size="3xlarge" />
			</div>
		{/if}
	</div>
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.graph {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16, --a-spacing-4);
	}

	.heading {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--spacing-layout);
	}

	.content {
		max-width: 80ch;
	}
</style>
