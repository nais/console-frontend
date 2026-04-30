<script lang="ts">
	import CostChart from '$lib/chart/CostChart.svelte';
	import { aggregateAndSortCostByDate, prepareMonthlyCostSeries } from '$lib/domain/cost/cost';
	import { Detail } from '@nais/ds-svelte-community';

	interface Props {
		readonly nodes: {
			readonly cost: {
				readonly monthly: {
					readonly series: {
						readonly date: Date;
						readonly sum: number;
					}[];
				};
			};
		}[];
	}

	let { nodes }: Props = $props();

	let data = $derived.by(() => {
		return prepareMonthlyCostSeries(aggregateAndSortCostByDate(nodes));
	});
</script>

{#if data.length}
	<CostChart {data} dateField="date" valueField="sum" class="mt-3 mb-5 h-45 w-[93%] pl-[7%]" />
{:else}
	<Detail>Insufficient data to display cost.</Detail>
{/if}
