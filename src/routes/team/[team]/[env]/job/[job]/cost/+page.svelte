<script lang="ts">
	import type { JobCost$result } from '$houdini';
	import Card from '$lib/Card.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import {
		costTransformPie,
		costTransformStackedColumnChart,
		costTransformTrend
	} from '$lib/chart/cost_transformer';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	export let data: PageData;

	$: ({ JobCost } = data);

	function echartOptionsTrend(data: JobCost$result['cost']) {
		const opts = costTransformTrend(data);

		opts.title = {
			text: 'Cost trend per product last 30 days',
			subtext: 'Cost per day (final day might be incomplete)'
		};
		return opts;
	}

	function echartOptionsPie(data: JobCost$result['cost']) {
		const opts = costTransformPie(data);

		opts.title = {
			text: 'Cost per product last 30 days'
		};
		return opts;
	}

	function echartOptionsBar(data: JobCost$result['cost']) {
		const opts = costTransformStackedColumnChart(data);

		opts.title = {
			text: 'Cost per product last 30 days'
		};
		return opts;
	}
</script>

{#if $JobCost.errors}
	<Alert variant="error">
		{#each $JobCost.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}

{#if $JobCost.data}
	<Card>
		<EChart options={echartOptionsBar($JobCost.data.cost)} style="height: 400px" />
	</Card>
	<Card>
		<EChart options={echartOptionsPie($JobCost.data.cost)} style="height: 400px" />
	</Card>
	<Card>
		<EChart options={echartOptionsTrend($JobCost.data.cost)} style="height: 400px" />
	</Card>
{/if}
