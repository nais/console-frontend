<script lang="ts">
	import { page } from '$app/stores';
	import type { AppCost$result } from '$houdini';
	import EChart from '$lib/chart/EChart.svelte';
	import { costTransform } from '$lib/chart/cost_transformer';
	import Card from '$lib/Card.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	export let data: PageData;

	$: ({ AppCost } = data);
	$: env = $page.params.env;
	$: app = $page.params.app;
	const from = Date.now();
	const to = new Date(Date.now() - 1 * 1000 * 24 * 60 * 60);
	const sum = (a: any) => {
		let sum = 0;
		a.forEach((a: { date: Date; cost: number }) => {
			sum += a.cost;
		});
		return sum;
	};
	function echartOptions(data: AppCost$result['cost']) {
		const opts = costTransform(data);

		opts.title = {
			text: 'Cost per product',
			subtext: 'Cost per day (final day might be incomplete)'
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
		Total cost per type
		{#each $AppCost.data.cost.series as series}
			<div>
				{series.costType}<br />
				{sum(series.data)}
			</div>
		{/each}
	</Card>
	<Card
		>trend over time
		{#if $AppCost.data?.cost}
			<EChart options={echartOptions($AppCost.data.cost)} style="height: 400px" />
		{/if}
	</Card>
{/if}
