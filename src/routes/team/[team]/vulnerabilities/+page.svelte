<script lang="ts">
	import TeamCveSearch from '#lib/domain/vulnerability/TeamCveSearch.svelte';
	import TeamMeanTimeToFixHistoryGraph from '#lib/domain/vulnerability/TeamMeanTimeToFixHistoryGraph.svelte';
	import ReanalyzeVulnerabilities from '#lib/domain/vulnerability/ReanalyzeVulnerabilities.svelte';
	import {
		getReanalysisReceipts,
		type ReanalysisReceipt
	} from '#lib/domain/vulnerability/reanalysisReceipt.js';
	import TeamVulnerabilityHistoryGraph from '#lib/domain/vulnerability/TeamVulnerabilityHistoryGraph.svelte';
	import VulnerabilitySummary from '#lib/domain/vulnerability/VulnerabilitySummary.svelte';
	import WorkloadsWithoutSbom from '#lib/domain/vulnerability/WorkloadsWithoutSbom.svelte';
	import WorkloadsWithVulnerabilities from '#lib/domain/vulnerability/WorkloadsWithVulnerabilities.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { Alert, BodyLong, Heading } from '@nais/ds-svelte-community';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let {
		TeamVulnerabilities,
		TeamNoSbomWorkloads,
		TeamPriorityWorkloadsHigh,
		TeamSeverityWorkloads,
		teamSlug,
		viewerIsMember
	} = $derived(data);

	let refreshError = $state('');
	let receiptState = $state<{ team: string; receipts: ReanalysisReceipt[] } | null>(null);
	let receipts = $derived(receiptState?.team === teamSlug ? receiptState.receipts : []);

	function handleReceipt(requested: ReanalysisReceipt) {
		receiptState = {
			team: teamSlug,
			receipts: [
				...receipts.filter((saved) => saved.environment !== requested.environment),
				requested
			]
		};
	}

	onMount(() => {
		try {
			receiptState = { team: teamSlug, receipts: getReanalysisReceipts(['team', teamSlug]) };
		} catch {
			refreshError = 'Could not restore the previous reanalysis request.';
		}
		const interval = window.setInterval(async () => {
			if (document.hidden || $TeamVulnerabilities.fetching || !$TeamVulnerabilities.variables)
				return;
			try {
				await Promise.all([
					TeamVulnerabilities.fetch({
						policy: 'NetworkOnly',
						variables: { ...$TeamVulnerabilities.variables }
					}),
					$TeamNoSbomWorkloads.variables && !$TeamNoSbomWorkloads.fetching
						? TeamNoSbomWorkloads.fetch({
								policy: 'NetworkOnly',
								variables: { ...$TeamNoSbomWorkloads.variables }
							})
						: null
				]);
				refreshError = '';
			} catch {
				refreshError = 'Could not refresh vulnerability data. Reload the page to try again.';
			}
		}, 60_000);
		return () => window.clearInterval(interval);
	});
</script>

<GraphErrors errors={$TeamVulnerabilities.errors} />
{#if refreshError}<Alert variant="error">{refreshError}</Alert>{/if}

{#if $TeamVulnerabilities.data}
	{const missingSbomCount = $derived(
		$TeamVulnerabilities.data.team.workloadsWithoutSbom.pageInfo.totalCount
	)}
	{const workloadCount = $derived($TeamVulnerabilities.data.team.workloads.pageInfo.totalCount)}
	{const noSboms = $derived(
		workloadCount > 0 && $TeamVulnerabilities.data.team.vulnerabilitySummary?.sbomCount === 0
	)}
	<div class="wrapper">
		{#if noSboms || missingSbomCount > 0}
			{#key teamSlug}
				<WorkloadsWithoutSbom
					count={noSboms ? workloadCount : missingSbomCount}
					allWithoutUsableSbom={noSboms}
					workloadsWithoutSbom={TeamNoSbomWorkloads}
				/>
			{/key}
		{/if}

		{#if noSboms && viewerIsMember}
			{#key teamSlug}
				<ReanalyzeVulnerabilities
					team={teamSlug}
					onreceipt={handleReceipt}
					environments={$TeamVulnerabilities.data.team.environments.map(
						(env) => env.environment.name
					)}
				/>
			{/key}
		{/if}

		{#if $TeamVulnerabilities.data.team.vulnerabilitySummary && !noSboms}
			{const urgentCount = $derived(
				$TeamVulnerabilities.data.team.urgentVulnerabilityIssues.pageInfo.totalCount
			)}
			{const exploitedWorkloadCount = $derived(
				$TeamVulnerabilities.data.team.exploitedWorkloads.pageInfo.totalCount
			)}
			<VulnerabilitySummary
				vulnerabilitySummary={$TeamVulnerabilities.data.team.vulnerabilitySummary}
				knownExploitedHref="?view=priority#priority-groups"
				{urgentCount}
				knownExploitedWorkloadCount={exploitedWorkloadCount}
			/>
		{/if}

		{#if !noSboms}
			<section aria-labelledby="workload-vulnerabilities">
				<Heading as="h2" size="medium" spacing id="workload-vulnerabilities"
					>Workload Vulnerabilities</Heading
				>

				<div class="cve-search-section">
					<Heading as="h3" size="small" id="cve-search">Search for vulnerability</Heading>
					<BodyLong size="small"
						>Find details and suppress a CVE across your team's workloads.</BodyLong
					>
					<TeamCveSearch team={teamSlug} />
				</div>

				{#key teamSlug}
					<WorkloadsWithVulnerabilities
						team={teamSlug}
						{receipts}
						high={TeamPriorityWorkloadsHigh}
						severity={TeamSeverityWorkloads}
						environmentNames={$TeamVulnerabilities.data.team.environments.map(
							(env) => env.environment.name
						)}
						highWorkloadCount={$TeamVulnerabilities.data.team.vulnerabilitySummary
							?.highWorkloadCount}
						elevatedWorkloadCount={$TeamVulnerabilities.data.team.vulnerabilitySummary
							?.elevatedWorkloadCount}
						monitorWorkloadCount={$TeamVulnerabilities.data.team.vulnerabilitySummary
							?.monitorWorkloadCount}
					>
						{#snippet reanalysis()}
							{#if viewerIsMember}
								<ReanalyzeVulnerabilities
									team={teamSlug}
									onreceipt={handleReceipt}
									environments={$TeamVulnerabilities.data.team.environments.map(
										(env) => env.environment.name
									)}
								/>
							{/if}
						{/snippet}
					</WorkloadsWithVulnerabilities>
				{/key}
			</section>

			<section aria-label="Vulnerability History">
				<TeamVulnerabilityHistoryGraph {teamSlug} />
			</section>

			<section aria-label="Mean Time to Fix">
				<TeamMeanTimeToFixHistoryGraph {teamSlug} />
			</section>
		{/if}
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--ax-space-32);
		min-width: 0;
	}

	.cve-search-section {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		padding-bottom: var(--spacing-layout);
	}
</style>
