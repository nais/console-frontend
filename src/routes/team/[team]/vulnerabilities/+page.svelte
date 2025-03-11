<script lang="ts">
	import Card from '$lib/Card.svelte';

	import { PendingValue, TeamVulnerabilityRiskScoreTrend, TeamVulnerabilityState } from '$houdini';
	import Nais from '$lib/icons/Nais.svelte';

	import { page } from '$app/state';
	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import Vulnerability from '$lib/components/Vulnerability.svelte';
	import WorkloadsWithSbom from '$lib/components/WorkloadsWithSBOM.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Alert, Heading, HelpText, Select, Skeleton } from '@nais/ds-svelte-community';
	import {
		TrendDownIcon,
		TrendFlatIcon,
		TrendUpIcon,
		XMarkOctagonIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { teamSlug } = $derived(data);

	let selectedEnvironment: string = $state(page.url.searchParams.get('environment') || '');

	let { TeamVulnerabilities } = $derived(data);
</script>

<GraphErrors errors={$TeamVulnerabilities.errors} />

{#if $TeamVulnerabilities.data}
	{@const team = $TeamVulnerabilities.data.team}
	<div class="grid">
		<Card columns={12}>
			<div class="vulnerabilitySummary">
				{#if team === PendingValue}
					<Skeleton variant="circle" style="min-height: 66px; min-width: 66px;" />
				{:else if team.vulnerabilitySummary.status.filter((status) => status.state !== TeamVulnerabilityState.OK).length > 0}
					<XMarkOctagonIcon font-size="66px" style="color: var(--a-icon-danger)" />
				{:else}
					<Nais
						size="66px"
						style="color: var(--a-icon-success)"
						aria-label="Team is nais"
						role="image"
					/>
				{/if}

				<div class="summary">
					<div class="heading">
						<Heading level="2" size="xsmall">Vulnerability summary</Heading>
						<HelpText title="Current team vulnerability status"
							>If any of the workloads have any vulnerability issues, the icon will show a warning
							sign and a details link will show.
						</HelpText>
					</div>

					<div style="margin-top: 0.5rem;">
						{#if team === PendingValue}
							<Skeleton variant="text" style="min-height: 1rem; width: 10%;" />
						{:else if team.vulnerabilitySummary.status.filter((status) => status.state !== TeamVulnerabilityState.OK).length > 0}
							{#if team?.vulnerabilitySummary.bomCount > 0}
								<details>
									<summary style="font-size: 1rem; var(--color-text-secondary);"
										>Show details</summary
									>
									{#each team?.vulnerabilitySummary.status.filter((status) => status.state !== TeamVulnerabilityState.OK) as status (status)}
										<div class="wrapper">
											<Alert variant="error">
												<h4>{status.title}</h4>
												{status.description}
											</Alert>
										</div>
									{/each}
								</details>
							{:else}
								<span>No workloads with vulnerability data found</span>
							{/if}
						{:else}
							<span>No vulnerability issues, good work! </span>
						{/if}
					</div>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<SummaryCard title="SBOM coverage" color="grey" styled={false}>
				{#snippet icon()}
					{#if team === PendingValue}
						<Skeleton variant="circle" style="min-height: 50px; min-width: 50px;" />
					{:else if team.vulnerabilitySummary.coverage >= 100}
						<Nais style="color: var(--a-icon-success)" aria-label="Workload is nais" role="image" />
					{:else}
						<CircleProgressBar
							progress={team.vulnerabilitySummary.coverage / 100}
							startColor="var(--a-icon-danger)"
							endColor="green"
						/>
					{/if}
				{/snippet}
				{#if team === PendingValue}
					<Skeleton variant="text" />
				{:else if team.vulnerabilitySummary.bomCount > 0}
					{team.vulnerabilitySummary.bomCount} of {team.workloads?.pageInfo.totalCount} workloads have
					SBOM
				{:else}
					No workloads with SBOM found
				{/if}
			</SummaryCard>
		</Card>
		<Card columns={3}>
			<SummaryCard title="Critical vulnerabilities" color="grey" styled={false}>
				{#snippet icon()}
					{#if team === PendingValue}
						<Skeleton variant="circle" style="min-height: 66px; min-width: 66px;" />
					{:else if team.vulnerabilitySummary.critical > 0}
						<Vulnerability
							count={team.vulnerabilitySummary.critical}
							severity="critical"
							size="66px"
						/>
					{:else}
						<code class="check">&check;</code>
					{/if}
				{/snippet}
				{#if team === PendingValue}
					<Skeleton variant="text" />
				{:else}
					{team.vulnerabilitySummary.critical} critical vulnerabilities
				{/if}
			</SummaryCard>
		</Card>
		<Card columns={3}>
			<SummaryCard title="Total risk score" color="grey" styled={false}>
				{#snippet icon()}
					{#if team === PendingValue}
						<Skeleton variant="rectangle" style="min-height: 80px; min-width: 50px;" />
					{:else if team.vulnerabilitySummary.riskScoreTrend === TeamVulnerabilityRiskScoreTrend.UP}
						<TrendUpIcon title="RiskScore" font-size="80" style="color: var(--a-icon-danger)" />
					{:else if team.vulnerabilitySummary.riskScoreTrend === TeamVulnerabilityRiskScoreTrend.DOWN}
						<TrendDownIcon title="RiskScore" font-size="80" style="color: var(--a-icon-success)" />
					{:else}
						<TrendFlatIcon title="RiskScore" font-size="80" style="color: var(--a-icon-warning)" />
					{/if}
				{/snippet}
				{#if team === PendingValue}
					<Skeleton variant="text" />
				{:else}
					{team.vulnerabilitySummary.riskScore}
				{/if}
			</SummaryCard>
		</Card>
		<Card columns={12}>
			<Heading level="3" size="small" spacing>Workloads with SBOM</Heading>

			<div class="env-filter">
				<Select size="small" hideLabel={true} bind:value={selectedEnvironment} label="Environment">
					<option value="">All environments</option>
					{#if team !== PendingValue && team.environments}
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
			<WorkloadsWithSbom team={teamSlug} environment={selectedEnvironment} />
		</Card>
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}

	.wrapper :global(.navds-alert__wrapper) {
		max-width: none;
	}
	.wrapper {
		padding-bottom: 0.5rem;
		font-size: 1rem;
	}
	.wrapper h4 {
		margin-bottom: 0.2rem;
		font-weight: bold;
		font-size: 1rem;
	}

	.summary {
		width: 100%;
		min-height: 80px;
	}

	.heading {
		display: flex;
		justify-content: space-between;
		margin: 0;
		color: var(--color-text-secondary);
	}

	.vulnerabilitySummary {
		display: flex;
		align-items: center;
		gap: 20px;
		align-items: start;
		min-height: 90px;
	}
	.env-filter {
		display: flex;
		margin-bottom: 1rem;
	}
	.check {
		font-size: 4rem;
		color: #4dbd74;
		text-align: center;
		padding-left: 4px;
	}
</style>
