<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import type { EChartsOption } from 'echarts';

	$: team = $page.params.team;

	function options(): EChartsOption {
		return {
			xAxis: {
				type: 'category',
				data: [
					'prod-gcp:sprute',
					'prod-gcp:spleis',
					'prod-gcp:spammer',
					'prod-gcp:sparkel-oppgave-endret',
					'prod-gcp:spetakkel',
					'prod-gcp:spout',
					'prod-gcp:spoiler'
				],
				axisLabel: {
					rotate: 270,
					inside: true,
					color: '#c0c0c0',
					textShadowBlur: 5,
					textShadowColor: '#000',
					textShadowOffsetX: 1,
					textShadowOffsetY: 1
				},
				z: 10
			},
			yAxis: {
				type: 'value'
			},
			series: [
				{
					data: [120, 200, 150, 80, 70, 110, 130],
					type: 'bar'
				}
			]
		};
	}
</script>

<div class="grid">
	<Card columns={4}>
		<p>You are wasting your government fundings!</p>
	</Card>
	<Card columns={8}>
		<EChart
			options={options()}
			style="height: 00px"
			on:click={(e) => {
				console.log(e.detail.name);
				const [env, app] = e.detail.name.split(':');
				goto(`/team/${team}/${env}/app/${app}/resources`);
			}}
		/>
	</Card>
	<Card columns={6}>Teamtotal CPU</Card>
	<Card columns={6}>Teamtotal Memory</Card>
</div>

<style>
	.grid {
		margin-top: 1rem;
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
</style>
