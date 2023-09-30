<script lang="ts">
	import type { AppCost$result } from '$houdini';
	import Card from '$lib/Card.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import {
		costTransformBar,
		costTransformPie,
		costTransformTrend
	} from '$lib/chart/cost_transformer';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	export let data: PageData;

	$: ({ AppCost } = data);

	function echartOptionsTrend(data: AppCost$result['cost']) {
		const opts = costTransformTrend(data);

		opts.title = {
			text: 'Cost trend per product last 30 days',
			subtext: 'Cost per day (final day might be incomplete)'
		};
		return opts;
	}

	function echartOptionsPie(data: AppCost$result['cost']) {
		const opts = costTransformPie(data);

		opts.title = {
			text: 'Cost per product last 30 days'
		};
		return opts;
	}

	function echartOptionsBar(data: AppCost$result['cost']) {
		const opts = costTransformBar(data);

		opts.title = {
			text: 'Cost per product last 30 days'
		};
		return opts;
	}
</script>

{#if $AppCost.errors}
	<Alert variant="error">
		{#each $AppCost.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}

{#if $AppCost.data}
	<Card>
		<EChart options={echartOptionsBar($AppCost.data.cost)} style="height: 400px" />
	</Card>
	<Card>
		<EChart options={echartOptionsPie($AppCost.data.cost)} style="height: 400px" />
	</Card>
	<Card>
		<EChart options={echartOptionsTrend($AppCost.data.cost)} style="height: 400px" />
	</Card>
{/if}
