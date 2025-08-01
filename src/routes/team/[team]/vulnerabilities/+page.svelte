<script lang="ts">
	import TeamErrorMessage from '$lib/components/errors/TeamErrorMessage.svelte';
	import TeamVulnerabilityHistoryGraph from '$lib/components/vulnerability/TeamVulnerabilityHistoryGraph.svelte';
	import VulnerabilitySummary from '$lib/components/vulnerability/VulnerabilitySummary.svelte';
	import WorkloadsWithVulnerabilities from '$lib/components/vulnerability/WorkloadsWithVulnerabilities.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Nais from '$lib/icons/Nais.svelte';
	import { BodyLong, BodyShort, Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TeamVulnerabilities, teamSlug } = $derived(data);
</script>

<GraphErrors errors={$TeamVulnerabilities.errors} />

{#if $TeamVulnerabilities.data}
	{@const team = $TeamVulnerabilities.data.team}
	<div class="wrapper">
		<div class="columns">
			<div class="status">
				<div class="alerts-wrapper">
					{#if $TeamVulnerabilities.data.team.missing_sbom.pageInfo.totalCount > 0}
						<TeamErrorMessage
							collapsible={false}
							error={{
								__typename: 'WorkloadStatusMissingSBOM',
								level: 'TODO'
							}}
							{teamSlug}
							workloads={$TeamVulnerabilities.data.team.missing_sbom.nodes ?? []}
						/>
					{/if}
					{#if $TeamVulnerabilities.data.team.vulnerable.pageInfo.totalCount > 0}
						<TeamErrorMessage
							collapsible={false}
							error={{
								__typename: 'WorkloadStatusVulnerable',
								level: 'WARNING'
							}}
							{teamSlug}
							workloads={$TeamVulnerabilities.data.team.vulnerable.nodes ?? []}
						/>
					{/if}
					{#if $TeamVulnerabilities.data.team.missing_sbom.pageInfo.totalCount == 0 && $TeamVulnerabilities.data.team.vulnerable.pageInfo.totalCount == 0}
						<div class="media-object">
							<Nais
								size="80px"
								style="color: var(--ax-text-success-decoration)"
								aria-label="Team is nais"
								role="image"
							/>
							<div>
								<BodyShort spacing>
									<strong>Nais!</strong> Your team currently has no workloads with a risk score above
									100 and no critical vulnerabilities. This means your security posture is strong, and
									your dependencies are well-maintained.
								</BodyShort>
								<BodyShort>
									Keep up the good work in monitoring and updating your workloads to maintain this
									status!
								</BodyShort>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<VulnerabilitySummary
				{teamSlug}
				workloads={team.workloads}
				vulnerabilitySummary={team.vulnerabilitySummary}
			/>
		</div>

		<TeamVulnerabilityHistoryGraph {teamSlug} />

		<div>
			<div class="heading">
				<div class="content">
					<Heading level="3" size="medium" spacing id="most_vulnerable_workloads"
						>Most Vulnerable Workloads</Heading
					>
					<BodyLong spacing>
						A list of this team's workloads with the highest security risk, based on Risk Score
						(default sorting). Use this list to focus remediation efforts where they’ll have the
						greatest impact.
					</BodyLong>
				</div>
			</div>

			<WorkloadsWithVulnerabilities team={teamSlug} />
		</div>
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		gap: var(--ax-space-32);
	}

	.heading {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--spacing-layout);
	}

	.content {
		max-width: 80ch;
	}

	.alerts-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}
	.media-object {
		padding: var(--ax-space-8);
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--ax-space-16);
		max-width: 75ch;
	}
	.status {
		display: grid;
		gap: var(--ax-space-8);
	}
	.columns {
		display: grid;
		grid-template-columns: 1fr 350px;
		gap: 1rem;
		align-items: start;
	}
</style>
