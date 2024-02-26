<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { TeamVulnerabilityMetrics$result } from '$houdini';
	import { graphql } from '$houdini';
	import EChart from '$lib/chart/EChart.svelte';
	import { vulnerabilitiesTeamTransformLineChart } from '$lib/chart/vulnerabilies_transformer';
	import { Alert, Select } from '@nais/ds-svelte-community';
	import { get } from 'svelte/store';
	import type { TeamVulnerabilityMetricsVariables } from './$houdini';

	export const _TeamVulnerabilityMetricsVariables: TeamVulnerabilityMetricsVariables = () => {
		const url = get(page).url;

		const fromParam = url.searchParams.get('from');
		const toParam = url.searchParams.get('to');

		const fromDate = fromParam
			? new Date(fromParam)
			: new Date(Date.now() - 7 * 1000 * 24 * 60 * 60);
		const toDate = toParam ? new Date(toParam) : new Date(Date.now());

		from = fromDate.toISOString().split('T')[0];
		to = toDate.toISOString().split('T')[0];

		return { from: fromDate, to: toDate, slug: team };
	};

	let from = '';
	let to = '';

	const vulnerabilities = graphql(`
		query TeamVulnerabilityMetrics($slug: Slug!, $from: Date!, $to: Date!, $environment: String)
		@load
		@cache(policy: NetworkOnly) {
			team(slug: $slug) {
				environments {
					name
				}
				vulnerabilityMetrics(from: $from, to: $to, environment: $environment) {
					minDate
					maxDate
					data {
						date
						critical
						high
						medium
						low
						unassigned
						riskScore
					}
				}
			}
		}
	`);

	export let team: string;
	let selectedEnvironment = '';

	function echartOptionsUsageChart(metrics: TeamVulnerabilityMetrics$result) {
		const opts = vulnerabilitiesTeamTransformLineChart(metrics);
		opts.height = '350px';
		opts.legend = { ...opts.legend, bottom: 10 };
		return opts;
	}

	function update() {
		const params = new URLSearchParams({ from, to });
		goto(`?${params.toString()}`, { replaceState: true, noScroll: true });

		if (selectedEnvironment === '') {
			vulnerabilities.fetch({
				variables: {
					slug: team,
					from: new Date(from),
					to: new Date(to),
					environment: null
				}
			});
			return;
		}

		vulnerabilities.fetch({
			variables: {
				slug: team,
				from: new Date(from),
				to: new Date(to),
				environment: selectedEnvironment
			}
		});
		return;
	}

	$: min = $vulnerabilities.data?.team.vulnerabilityMetrics.minDate?.toISOString().split('T')[0];
	$: max = $vulnerabilities.data?.team.vulnerabilityMetrics.maxDate?.toISOString().split('T')[0];
</script>

<h3>Vulnerabilities over time for team</h3>
{#if $vulnerabilities.errors}
	<Alert variant="error">
		{#each $vulnerabilities.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $vulnerabilities.data}
	<div class="select">
		<label for="from">From:</label>
		<input type="date" id="from" {min} max={to} bind:value={from} on:change={update} />
		<label for="to">To:</label>
		<input type="date" id="to" min={from} {max} bind:value={to} on:change={update} />
		<Select
			size="small"
			hideLabel={true}
			bind:value={selectedEnvironment}
			on:change={update}
			label="Environment"
		>
			<option value="">All environments</option>
			{#each $vulnerabilities.data?.team.environments as env}
				<option value={env.name}>{env.name}</option>
			{/each}
		</Select>
	</div>
	{#if $vulnerabilities.data?.team.vulnerabilityMetrics.data.length === 0}
		<p>No vulnerability metrics available for {team}.</p>
	{:else}
		<EChart
				options={echartOptionsUsageChart($vulnerabilities.data)}
				style="height: 500px; width: 100%;"
		/>
	{/if}
{/if}

<style>
	.select {
		display: flex;
		gap: 1rem;
		margin: 1rem 0;
		height: 28px;
	}
</style>
