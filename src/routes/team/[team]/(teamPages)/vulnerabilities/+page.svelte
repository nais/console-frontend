<script lang="ts">
	import Card from '$lib/Card.svelte';

	import {
		PendingValue,
		TeamVulnerabilityRanking,
		TeamVulnerabilityRiskScoreTrend,
		TeamVulnerabilityState
	} from '$houdini';
	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
	import Nais from '$lib/icons/Nais.svelte';

	import { page } from '$app/stores';
	import Vulnerability from '$lib/components/Vulnerability.svelte';
	import WorkloadsWithSbom from '$lib/components/WorkloadsWithSBOM.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Alert, HelpText, Select, Skeleton } from '@nais/ds-svelte-community';
	import {
		FaceFrownIcon,
		FaceIcon,
		FaceSmileIcon,
		TrendDownIcon,
		TrendFlatIcon,
		TrendUpIcon,
		XMarkOctagonIcon
	} from '@nais/ds-svelte-community/icons';
	import { get } from 'svelte/store';
	import type { PageData } from './$houdini';

	export let data: PageData;

	let selectedEnvironment: string = '';
	selectedEnvironment = get(page).url.searchParams.get('environment') || '';

	$: ({ TeamVulnerabilities } = data);
</script>

{#if $TeamVulnerabilities.errors}
	<Alert variant="error">
		{#each $TeamVulnerabilities.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}
{#if $TeamVulnerabilities.data}
	{@const team = $TeamVulnerabilities.data.team}
	<div class="grid">
		<Card columns={12}>
			<div class="summaryCard" style="align-items: start; min-height: 90px">
				{#if team?.vulnerabilitySummary.bomCount !== PendingValue}
					{#if team?.vulnerabilitySummary?.status.filter((status) => status.state !== TeamVulnerabilityState.OK)}
						<div>
							<XMarkOctagonIcon font-size="66px" style="color: var(--a-icon-danger)" />
						</div>
					{:else}
						<div>
							<Nais
								size="66px"
								style="color: var(--a-icon-success)"
								aria-label="Team is nais"
								role="image"
							/>
						</div>
					{/if}
				{:else}
					<div>
						<Skeleton variant="rounded" width="66px" height="66px" />
					</div>
				{/if}
				<div class="summary">
					<h4>
						<span>Vulnerability issues</span>
						<HelpText title="Current team vulnerability status"
							>If any of the workloads have any vulnerability issues, the icon will show a warning
							sign and a details link will show.
						</HelpText>
					</h4>
					<div style="margin-top: 0.5rem;">
						{#if team?.vulnerabilitySummary.bomCount !== PendingValue}
							{#if team?.vulnerabilitySummary?.status && team.vulnerabilitySummary.status.filter((status) => status.state !== TeamVulnerabilityState.OK)}
								{#if team?.vulnerabilitySummary.bomCount > 0}
									<details>
										<summary style="font-size: 1rem; var(--color-text-secondary);"
											>Show details</summary
										>
										{#each team?.vulnerabilitySummary.status.filter((status) => status.state !== TeamVulnerabilityState.OK) as status}
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
						{:else}
							<Skeleton variant="rounded" width="10rem" />
						{/if}
					</div>
				</div>
			</div>
		</Card>
		<Card columns={3} style="display: flex; align-items:center;">
			<div class="summaryCard">
				<div>
					{#if team?.vulnerabilitySummary.coverage !== PendingValue}
						{#if team.vulnerabilitySummary.coverage >= 100}
							<Nais
								size="66px"
								style="color: var(--a-icon-success)"
								aria-label="Workload is nais"
								role="image"
							/>
						{:else}
							<CircleProgressBar
								size="66px"
								progress={team.vulnerabilitySummary.coverage / 100}
								startColor="var(--a-icon-danger)"
								endColor="green"
							/>
						{/if}
					{:else}
						<div>
							<Skeleton variant="circle" width="66px" height="66px" />
						</div>
					{/if}
				</div>
				<div class="summary">
					<h4>
						SBOM coverage
						<HelpText title="Current SBOM coverage">Workloads with an SBOM.</HelpText>
					</h4>
					<p class="metric">
						{#if team?.vulnerabilitySummary.bomCount !== PendingValue}
							{team.vulnerabilitySummary.bomCount} of {team.workloads?.pageInfo.totalCount}
							workloads
						{:else}
							<Skeleton variant="text" width="44px" />
						{/if}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3} style="display: flex; align-items:center;">
			<div class="summaryCard">
				{#if team !== undefined}
					<div style="--bg-color: #C8C8C8; display:flex; align-items:center;">
						<Vulnerability
							count={team.vulnerabilitySummary.critical}
							severity="critical"
							size={'66px'}
						/>
					</div>
					<div class="summary">
						<h4>Critical vulnerabilities</h4>
					</div>
				{/if}
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div class="summaryIcon" style="--bg-color: #C8C8C8">
					{#if team?.vulnerabilitySummary.riskScoreTrend !== PendingValue}
						{#if team.vulnerabilitySummary.riskScoreTrend === TeamVulnerabilityRiskScoreTrend.UP}
							<TrendUpIcon title="RiskScore" font-size="80" style="color: var(--a-icon-danger)" />
						{:else if team.vulnerabilitySummary.riskScoreTrend === TeamVulnerabilityRiskScoreTrend.DOWN}
							<TrendDownIcon
								title="RiskScore"
								font-size="80"
								style="color: var(--a-icon-success)"
							/>
						{:else}
							<TrendFlatIcon
								title="RiskScore"
								font-size="80"
								style="color: var(--a-icon-warning)"
							/>
						{/if}
					{:else}
						<Skeleton variant="rounded" width="66px" height="66px" />
					{/if}
				</div>
				<div class="summary">
					<h4>
						Total risk score
						<HelpText title="Current team total risk score"
							>The total risk score for the team's vulnerabilities. The icon will also show trend up
							or down since last month.
						</HelpText>
					</h4>
					<p class="metric">
						{#if team?.vulnerabilitySummary.riskScore !== PendingValue}
							{team.vulnerabilitySummary.riskScore}
						{:else}
							<Skeleton variant="text" width="44px" />
						{/if}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				{#if team?.vulnerabilitySummary.ranking !== PendingValue}
					{#if team.vulnerabilitySummary.ranking === TeamVulnerabilityRanking.MOST_VULNERABLE}
						<div class="summaryIcon" style="--bg-color: #C8C8C8">
							<FaceFrownIcon
								title="Most vulnerable"
								font-size="80"
								style={'color: var(--a-icon-danger)'}
							/>
						</div>
						<div class="summary">
							<p>
								Team is ranked among the most vulnerable
								<HelpText title="Team ranking"
									>Ranking of the team's risk score compared to other teams. Your team is among the
									most vulnerable teams in the organisation. If you are missing SBOMs on any of your
									workloads this ranking will not be accurate.
								</HelpText>
							</p>
						</div>
					{:else if team.vulnerabilitySummary.ranking === TeamVulnerabilityRanking.LEAST_VULNERABLE}
						<div class="summaryIcon" style="--bg-color: #C8C8C8">
							<FaceSmileIcon
								title="Least vulnerable"
								font-size="80"
								style={'color: var(--a-icon-success)'}
							/>
						</div>
						<div class="summary">
							<p>
								Team is ranked among the least vulnerable
								<HelpText title="Team ranking"
									>Ranking of the team's risk score compared to other teams. Your team is ranked
									among the least vulnerable teams in the organisation. If you are missing SBOMs on
									any of your workloads this ranking will not be accurate.
								</HelpText>
							</p>
						</div>
					{:else if team.vulnerabilitySummary.ranking === TeamVulnerabilityRanking.MIDDLE}
						<div class="summaryIcon" style="--bg-color: #C8C8C8">
							<FaceIcon
								title="Average ranking"
								font-size="80"
								style={'color: var(--a-icon-warning)'}
							/>
						</div>
						<div class="summary">
							<p>
								Team is ranked in the middle
								<HelpText title="Current team ranking"
									>Ranking of the team's risk score compared to other teams. Your team is ranked in
									the middle of your organisations teams. If you are missing SBOMs on any of your
									workloads this ranking will not be accurate.
								</HelpText>
							</p>
						</div>
					{:else}
						<div class="summaryIcon" style="--bg-color: #C8C8C8">
							<FaceFrownIcon
								title="Unknown ranking"
								font-size="80"
								style={'color: var(--a-icon-danger)'}
							/>
						</div>
						<div class="summary">
							<p>
								Ranking is unknown
								<HelpText title="Current team ranking"
									>Ranking of the team's risk score compared to other teams. If your ranking is
									unknown this is usually because you are missing SBOMs on your workloads.
								</HelpText>
							</p>
						</div>
					{/if}
				{:else}
					<div class="summaryIcon" style="--bg-color: #C8C8C8">
						<Skeleton variant="rounded" width="66px" height="66px" />
					</div>
					<div class="summary">
						<Skeleton variant="text" />
					</div>
				{/if}
			</div>
		</Card>
		<Card columns={12}>
			<h4>Workloads with SBOM</h4>
			<div class="env-filter">
				<Select
					size="small"
					hideLabel={true}
					bind:value={selectedEnvironment}
					on:change={() => {
						changeParams({
							environment: selectedEnvironment
						});
					}}
					label="Environment"
				>
					<option value="">All environments</option>

					{#each team.environments as env}
						{#if env.name !== PendingValue}
							{#if env.name === selectedEnvironment}
								<option value={env.name} selected={true}>{env.name}</option>
							{:else}
								<option value={env.name}>{env.name}</option>
							{/if}
						{/if}
					{/each}
				</Select>
			</div>
			{#key selectedEnvironment}
				<WorkloadsWithSbom team={$page.params.team} environment={selectedEnvironment} />
			{/key}
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
	.summaryIcon {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.summary {
		width: 100%;
		min-height: 80px;
	}
	.summary > h4 {
		display: flex;
		justify-content: space-between;
		margin: 0;
		font-size: 1rem;
		color: var(--color-text-secondary);
	}
	.summary > p {
		display: flex;
		justify-content: space-between;
		margin: 0;
		font-size: 1rem;
		color: var(--color-text-secondary);
	}
	.metric {
		font-size: 1.3rem;
		margin: 0;
	}
	.summaryCard {
		display: flex;
		align-items: center;
		gap: 20px;
	}
	.env-filter {
		display: flex;
		margin-bottom: 1rem;
	}
</style>
