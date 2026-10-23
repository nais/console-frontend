<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { OrderDirection, SBOMStatus, WorkloadOrderField } from '$houdini';
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
	let receiptError = $state('');
	let receiptState = $state<{ team: string; receipts: ReanalysisReceipt[] } | null>(null);
	let receipts = $derived(receiptState?.team === teamSlug ? receiptState.receipts : []);

	function handleReceipt(team: string, requested: ReanalysisReceipt) {
		if (team !== teamSlug) return;
		receiptState = {
			team: teamSlug,
			receipts: [
				...receipts.filter((saved) => saved.environment !== requested.environment),
				requested
			]
		};
	}

	afterNavigate(() => {
		const currentTeam = teamSlug;
		try {
			receiptState = { team: currentTeam, receipts: getReanalysisReceipts(['team', currentTeam]) };
			receiptError = '';
		} catch {
			receiptState = null;
			receiptError = 'Could not restore the previous reanalysis request.';
		}
	});

	onMount(() => {
		const interval = window.setInterval(async () => {
			const currentTeam = teamSlug;
			if (
				document.hidden ||
				$TeamVulnerabilities.fetching ||
				$TeamVulnerabilities.variables?.team !== currentTeam
			)
				return;
			try {
				const result = await TeamVulnerabilities.fetch({
					policy: 'NetworkOnly',
					variables: { ...$TeamVulnerabilities.variables }
				});
				if (currentTeam !== teamSlug) return;
				const team = result.data?.team;
				if (!team) throw new Error('Could not load vulnerability summary.');
				const missing = team.workloadsWithoutSbom.pageInfo.totalCount;
				const total = team.workloads.pageInfo.totalCount;
				const noSboms = total > 0 && team.vulnerabilitySummary?.sbomCount === 0;
				if ((noSboms || missing > 0) && !$TeamNoSbomWorkloads.fetching) {
					const previous = $TeamNoSbomWorkloads.variables;
					const sbomStatus = noSboms ? null : SBOMStatus.NO_SBOM;
					await TeamNoSbomWorkloads.fetch({
						policy: 'NetworkOnly',
						variables:
							previous?.team === currentTeam && previous.sbomStatus === sbomStatus
								? { ...previous }
								: {
										team: currentTeam,
										first: 20,
										last: null,
										after: null,
										before: null,
										sbomStatus,
										orderBy: { field: WorkloadOrderField.NAME, direction: OrderDirection.ASC }
									}
					});
				}
				if (currentTeam === teamSlug) refreshError = '';
			} catch {
				if (currentTeam === teamSlug)
					refreshError = 'Could not refresh vulnerability data. Reload the page to try again.';
			}
		}, 60_000);
		return () => window.clearInterval(interval);
	});
</script>

<GraphErrors errors={$TeamVulnerabilities.errors} />
{#if receiptError}<Alert variant="error">{receiptError}</Alert>{/if}
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
						initialView={data.initialView}
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
							{#if viewerIsMember && $TeamVulnerabilities.data}
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
