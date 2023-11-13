<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { PendingValue, type ResourceUtilizationForTeam$result } from '$houdini';
	import Card from '$lib/Card.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import {
		resourceUsageTeamCPUTransformLineChart,
		resourceUsageTeamMemoryTransformLineChart,
		type Utilization
	} from '$lib/chart/resource_usage_transformer';
	import { Alert, Loader } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ ResourceUtilizationForTeam } = data);

	$: team = $page.params.team;

	/*function options(): EChartsOption {
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
					'prod-gcp:spoiler',
					'prod-gcp:sporbar',
					'prod-gcp:sporbar-frontend',
					'prod-gcp:sporbar-frontend-utvikling'
				],
				axisLabel: {
					rotate: 25
				}
			},
			legend: {
				data: [
					'prod-gcp:sprute',
					'prod-gcp:spleis',
					'prod-gcp:spammer',
					'prod-gcp:sparkel-oppgave-endret',
					'prod-gcp:spetakkel',
					'prod-gcp:spout',
					'prod-gcp:spoiler',
					'prod-gcp:sporbar',
					'prod-gcp:sporbar-frontend',
					'prod-gcp:sporbar-frontend-utvikling'
				]
			},
			yAxis: {
				type: 'value'
			},
			series: {
				data: [123, 120, 111, 110, 109, 108, 107, 106, 105, 104],
				type: 'bar',
				itemStyle: {
					color: new graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: '#83bff6' },
						{ offset: 0.5, color: '#188df0' },
						{ offset: 1, color: '#188df0' }
					])
				},
				emphasis: {
					itemStyle: {
						color: new graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: '#2378f7' },
							{ offset: 0.7, color: '#2378f7' },
							{ offset: 1, color: '#83bff6' }
						])
					}
				}
			},
			height: '200px'
		};
	}*/

	function echartOptionsCPUChart(data: Utilization[]) {
		const opts = resourceUsageTeamCPUTransformLineChart(data);
		opts.height = '250px';
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}
	function echartOptionsMemoryChart(data: Utilization[]) {
		const opts = resourceUsageTeamMemoryTransformLineChart(data);
		opts.height = '250px';
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}

	function waste(data: ResourceUtilizationForTeam$result) {
		let waste = 0;

		data.resourceUtilizationForTeam.forEach((utilization) => {
			if (utilization.env === PendingValue) return;
			utilization.cpu.forEach((c) => {
				waste += c.requestCostOverage;
			});
			utilization.memory.forEach((m) => {
				waste += m.requestCostOverage;
			});
		});

		return (Math.round(waste * 100) / 100).toFixed(2);
	}

	function update() {
		const params = new URLSearchParams({ from, to });
		goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
	}

	$: minDate = $ResourceUtilizationForTeam.data?.resourceUtilizationDateRangeForTeam.from;
	$: maxDate = $ResourceUtilizationForTeam.data?.resourceUtilizationDateRangeForTeam.to;

	$: min = minDate && minDate !== PendingValue ? minDate.toISOString().split('T')[0] : '';
	$: max = maxDate && maxDate !== PendingValue ? maxDate.toISOString().split('T')[0] : '';

	let from = data.fromDate?.toISOString().split('T')[0];
	let to = data.toDate?.toISOString().split('T')[0];

	$: {
		if (maxDate && maxDate !== PendingValue) {
			if (data.toDate > maxDate) {
				from = new Date(maxDate.getTime() - 7 * 1000 * 24 * 60 * 60).toISOString().split('T')[0];
				to = max;
				update();
			}
		}
	}
</script>

{#if $ResourceUtilizationForTeam.errors}
	<Alert variant="error">
		{#each $ResourceUtilizationForTeam.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}
{#if $ResourceUtilizationForTeam.data}
	<div class="grid">
		<Card columns={12}>
			<label for="from">From:</label>
			<input type="date" id="from" {min} {max} bind:value={from} on:change={update} />
			<label for="to">To:</label>
			<input type="date" id="to" {min} {max} bind:value={to} on:change={update} />
		</Card>
		<Card columns={4}>
			{#if $ResourceUtilizationForTeam.data.resourceUtilizationForTeam[0].env === PendingValue}
				<div class="loading">
					<Loader />
				</div>
			{:else}
				<p>Waste: {waste($ResourceUtilizationForTeam.data)} NOK</p>
			{/if}
		</Card>
		<!--Card columns={8}>
			<EChart
				options={options()}
				style="height: 400px"
				on:click={(e) => {
					console.log(e.detail.name);
					const [env, app] = e.detail.name.split(':');
					goto(`/team/${team}/${env}/app/${app}/resources`);
				}}
			/>
		</Card-->
		{#each $ResourceUtilizationForTeam.data.resourceUtilizationForTeam as env}
			<Card columns={12}>
				{#if env.env !== PendingValue}
					<h4>Utilization in {env.env}</h4>
				{/if}
				<div style="display: flex; ">
					<div style="width: 50%;">
						{#if env.env === PendingValue}
							<div class="loading">
								<Loader />
							</div>
						{:else if env.cpu.length === 0}
							<p>No CPU utilization data for team {team} in {env.env}</p>
						{:else}
							<EChart options={echartOptionsCPUChart(env.cpu)} style="height: 400px" />
						{/if}
					</div>
					<div style="width: 50%; margin: 0; padding: 0;">
						{#if env.env === PendingValue}
							<div class="loading">
								<Loader />
							</div>
						{:else if env.memory.length === 0}
							<p>No memory utilization data for team {team} in {env.env}</p>
						{:else}
							<EChart options={echartOptionsMemoryChart(env.memory)} style="height: 400px" />
						{/if}
					</div>
				</div>
			</Card>
		{/each}
	</div>
{/if}

<style>
	.grid {
		margin-top: 1rem;
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	.loading {
		height: 400px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
