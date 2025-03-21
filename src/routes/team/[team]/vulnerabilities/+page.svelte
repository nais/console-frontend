<script lang="ts">
	import { TeamVulnerabilityRiskScoreTrend, TeamVulnerabilityState } from '$houdini';
	import Nais from '$lib/icons/Nais.svelte';

	import { page } from '$app/state';
	import WorkloadsWithVulnerabilities from '$lib/components/WorkloadsWithVulnerabilities.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { severityToColor } from '$lib/utils/vulnerabilities';
	import { Alert, BodyLong, BodyShort, Heading, Select } from '@nais/ds-svelte-community';
	import { TrendDownIcon, TrendFlatIcon, TrendUpIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { teamSlug } = $derived(data);

	let selectedEnvironment: string = $state(page.url.searchParams.get('environment') || '');

	let { TeamVulnerabilities } = $derived(data);
</script>

<GraphErrors errors={$TeamVulnerabilities.errors} />

{#if $TeamVulnerabilities.data}
	{@const team = $TeamVulnerabilities.data.team}
	<div class="wrapper">
		<div class="columns">
			<div class="status">
				{#if team.vulnerabilitySummary.status.filter((status) => status.state !== TeamVulnerabilityState.OK).length > 0}
					{#if team?.vulnerabilitySummary.bomCount > 0}
						{#each team?.vulnerabilitySummary.status.filter((status) => status.state !== TeamVulnerabilityState.OK) as status (status)}
							<Alert variant="error">
								<Heading level="2" size="small" spacing>{status.title}</Heading>
								<BodyLong>{status.description}</BodyLong>
							</Alert>
						{/each}
					{:else}
						<span>No workloads with vulnerability data found</span>
					{/if}
				{:else}
					<div class="media-object">
						<Nais
							size="80px"
							style="color: var(--a-icon-success)"
							aria-label="Team is nais"
							role="image"
						/>
						<div>
							<BodyShort spacing>
								<strong>Nais!</strong> Your team currently has no workloads with a risk score above 100
								and no critical vulnerabilities. This means your security posture is strong, and your
								dependencies are well-maintained.
							</BodyShort>
							<BodyShort>
								Keep up the good work in monitoring and updating your workloads to maintain this
								status!
							</BodyShort>
						</div>
					</div>
				{/if}
			</div>

			<div>
				<div class="summary">
					<Heading size="small" level="2" spacing>Summary</Heading>
					<div class="grid">
						<span
							style={team.vulnerabilitySummary.status.some((s) => s.state === 'COVERAGE_TOO_LOW')
								? 'color: var(--a-text-danger)'
								: 'color: var(--a-surface-success)'}
							>{Math.round(
								(team.vulnerabilitySummary.bomCount / team.workloads.pageInfo.totalCount) * 100
							)}%</span
						>
						<div>
							{team.vulnerabilitySummary.bomCount} of {team.workloads.pageInfo.totalCount} workloads
							have SBOM
							<!-- (below defined threshold of 90%). -->
						</div>

						<span
							class="vulnerability-count"
							style:background-color={team.vulnerabilitySummary.critical
								? severityToColor({ severity: 'critical' })
								: undefined}>{team.vulnerabilitySummary.critical}</span
						>
						<div>Critical vulnerabilities</div>

						<div>
							{team.vulnerabilitySummary.riskScore}
						</div>
						<div>Total risk score</div>

						<div style:line-height="0">
							{#if team.vulnerabilitySummary.riskScoreTrend === TeamVulnerabilityRiskScoreTrend.UP}
								<TrendUpIcon style="color: var(--a-icon-danger);" font-size="50" />
							{:else if team.vulnerabilitySummary.riskScoreTrend === TeamVulnerabilityRiskScoreTrend.DOWN}
								<TrendDownIcon style="color: var(--a-icon-success);" font-size="50" />
							{:else}
								<TrendFlatIcon style="color: var(--a-icon-warning);" font-size="50" />
							{/if}
						</div>
						<div>Risk score trend</div>
					</div>
				</div>
			</div>
		</div>
		<div>
			<Heading level="3" size="medium" spacing>Workloads with vulnerabilities</Heading>

			<div class="env-filter">
				<Select size="small" hideLabel={true} bind:value={selectedEnvironment} label="Environment">
					<option value="">All environments</option>
					{#if team.environments}
						{#each team.environments as env (env.id)}
							{#if env.name === selectedEnvironment}
								<option value={env.name} selected={true}>{env.name}</option>
							{:else}
								<option value={env.name}>{env.name}</option>
							{/if}
						{/each}
					{/if}
				</Select>
			</div>
			<WorkloadsWithVulnerabilities team={teamSlug} environment={selectedEnvironment} />
		</div>
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: auto 1fr;
		column-gap: var(--a-spacing-4);
		row-gap: var(--a-spacing-6);
		align-items: center;

		> :nth-child(2n + 1) {
			font-size: 2rem;
			font-weight: 600;
			justify-self: center;
		}
	}
	.media-object {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--a-spacing-4);
		max-width: 75ch;
	}
	.status {
		display: grid;
		gap: var(--a-spacing-2);
	}
	.columns {
		display: grid;
		grid-template-columns: 1fr 350px;
		gap: 1rem;
		align-items: start;
	}

	.vulnerability-count {
		border-radius: 4px;
		padding: 4px 16px;
	}

	.wrapper {
		display: grid;
		gap: var(--a-spacing-4);
	}

	.summary {
		background-color: var(--a-surface-subtle);
		padding: var(--a-spacing-5);
		border-radius: 12px;
		justify-self: end;
	}

	.env-filter {
		display: flex;
		margin-bottom: 1rem;
	}
</style>
