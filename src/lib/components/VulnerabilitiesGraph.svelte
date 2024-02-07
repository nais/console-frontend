<script lang="ts">
	import type { TeamVulnerabilityMetrics$result } from '$houdini';
	import { graphql } from '$houdini';
	import EChart from '$lib/chart/EChart.svelte';
	import { vulnerabilitiesTeamTransformLineChart } from '$lib/chart/vulnerabilies_transformer';
	import type { TeamVulnerabilityMetricsVariables } from './$houdini';

	export const _TeamVulnerabilityMetricsVariables: TeamVulnerabilityMetricsVariables = () => {
		return { from: from, to: to, slug: team };
	};

	const vulnerabilities = graphql(`
		query TeamVulnerabilityMetrics($slug: Slug!, $from: Date!, $to: Date!)
		@load
		@cache(policy: NetworkOnly) {
			team(slug: $slug) {
				vulnerabilityMetrics(from: $from, to: $to) {
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
	`);

	export let from: Date;
	export let to: Date;
	export let team: string;

	function echartOptionsUsageChart(metrics: TeamVulnerabilityMetrics$result) {
		const opts = vulnerabilitiesTeamTransformLineChart(metrics);
		opts.height = '350px';
		opts.legend = { ...opts.legend, bottom: 10 };
		return opts;
	}
</script>

<h3>Vulnerabilities over time for team</h3>
{#if $vulnerabilities.errors}
	<p>Errors</p>
	<pre>{JSON.stringify($vulnerabilities.errors)}</pre>
{:else if $vulnerabilities.data}
	<EChart
		options={echartOptionsUsageChart($vulnerabilities.data)}
		style="height: 500px; width: 100%;"
	/>
{/if}
