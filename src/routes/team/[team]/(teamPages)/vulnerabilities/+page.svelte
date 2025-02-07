<script lang="ts">
	import Card from '$lib/Card.svelte';

	import { PendingValue, TeamVulnerabilityRiskScoreTrend, TeamVulnerabilityState } from '$houdini';
	import Nais from '$lib/icons/Nais.svelte';

	import { page } from '$app/stores';
	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
	import IconWithText from '$lib/components/IconWithText.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import Vulnerability from '$lib/components/Vulnerability.svelte';
	import WorkloadsWithSbom from '$lib/components/WorkloadsWithSBOM.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Alert, HelpText, Select, Skeleton } from '@nais/ds-svelte-community';
	import {
		TrendDownIcon,
		TrendFlatIcon,
		TrendUpIcon,
		VirusIcon,
		XMarkOctagonIcon
	} from '@nais/ds-svelte-community/icons';
	import { get } from 'svelte/store';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { teamSlug } = $derived(data);

	let selectedEnvironment: string = $state('');
	selectedEnvironment = get(page).url.searchParams.get('environment') || '';

	let { TeamVulnerabilities } = $derived(data);
</script>

<GraphErrors errors={$TeamVulnerabilities.errors} />
<div class="header">
	<IconWithText icon={VirusIcon} text="Vulnerabilities" size="large" />
</div>

{#if $TeamVulnerabilities.data}
	{@const team = $TeamVulnerabilities.data.team}
	<div class="grid">
		<Card columns={12}>
			<div class="vulnerabilitySummary">
				{#if team.vulnerabilitySummary.bomCount !== PendingValue}
					{#if team.vulnerabilitySummary.status.filter((status) => status.state !== TeamVulnerabilityState.OK).length > 0}
						<XMarkOctagonIcon font-size="66px" style="color: var(--a-icon-danger)" />
					{:else}
						<Nais
							size="66px"
							style="color: var(--a-icon-success)"
							aria-label="Team is nais"
							role="image"
						/>
					{/if}
				{:else}
					<Skeleton variant="rounded" width="66px" height="66px" />
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
						{#if team.vulnerabilitySummary.bomCount !== PendingValue}
							{#if team.vulnerabilitySummary.status.filter((status) => status.state !== TeamVulnerabilityState.OK).length > 0}
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
			<SummaryCard title="SBOM coverage" color="grey" styled={false}>
				{#snippet icon()}
					{#if team?.vulnerabilitySummary.coverage !== PendingValue}
						{#if team.vulnerabilitySummary.coverage >= 100}
							<Nais
								style="color: var(--a-icon-success)"
								aria-label="Workload is nais"
								role="image"
							/>
						{:else}
							<CircleProgressBar
								progress={team.vulnerabilitySummary.coverage / 100}
								startColor="var(--a-icon-danger)"
								endColor="green"
							/>
						{/if}
					{:else}
						<Skeleton variant="circle" width="66px" height="66px" />
					{/if}
				{/snippet}
				{#if team !== undefined}
					{#if team.vulnerabilitySummary.bomCount !== PendingValue}
						{#if team.vulnerabilitySummary.bomCount > 0}
							{team.vulnerabilitySummary.bomCount} of {team.workloads?.pageInfo.totalCount} workloads
							have SBOM
						{:else}
							No workloads with SBOM found
						{/if}
					{:else}
						<Skeleton variant="text" width="44px" />
					{/if}
				{/if}
			</SummaryCard>
		</Card>
		<Card columns={3} style="display: flex; align-items:center;">
			<SummaryCard title="Critical vulnerabilities" color={'grey'} styled={false}>
				{#snippet icon()}
					{#if team?.vulnerabilitySummary.critical !== PendingValue}
						{#if team.vulnerabilitySummary.critical > 0}
							<Vulnerability
								count={team.vulnerabilitySummary.critical}
								severity="critical"
								size={'66px'}
							/>
						{:else}
							<code class="check">&check;</code>
						{/if}
					{:else}
						<Skeleton variant="rounded" width="66px" height="66px" />
					{/if}
				{/snippet}
				{#if team !== undefined}
					{#if team.vulnerabilitySummary.critical !== PendingValue}
						{team.vulnerabilitySummary.critical} critical vulnerabilities
					{:else}
						<Skeleton variant="text" width="44px" />
					{/if}
				{/if}
			</SummaryCard>
		</Card>
		<Card columns={3}>
			<SummaryCard title="Total risk score" color={'grey'} styled={false}>
				{#snippet icon()}
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
				{/snippet}
				{#if team !== undefined}
					{#if team.vulnerabilitySummary.riskScore !== PendingValue}
						{team.vulnerabilitySummary.riskScore}
					{:else}
						<Skeleton variant="text" width="44px" />
					{/if}
				{/if}
			</SummaryCard>
		</Card>
		<Card columns={12}>
			<h4>Workloads with SBOM</h4>
			<div class="env-filter">
				<Select
					size="small"
					hideLabel={true}
					bind:value={selectedEnvironment}
					onchange={() => {
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
			<WorkloadsWithSbom team={teamSlug} environment={selectedEnvironment} />
		</Card>
	</div>
{/if}

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		align-self: stretch;
		margin-bottom: var(--a-spacing-3);
	}
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
	.summary > h4 {
		display: flex;
		justify-content: space-between;
		margin: 0;
		font-size: 1rem;
		color: var(--color-text-secondary);
		font-weight: bold;
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
