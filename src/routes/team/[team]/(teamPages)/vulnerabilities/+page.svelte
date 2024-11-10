<script lang="ts">
	import Card from '$lib/Card.svelte';

	import {
		TeamVulnerabilityRanking,
		TeamVulnerabilityRiskScoreTrend,
		TeamVulnerabilityState,
		WorkloadOrderField
	} from '$houdini';
	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import Nais from '$lib/icons/Nais.svelte';
	import VulnerabilityBadge from '$lib/icons/VulnerabilityBadge.svelte';
	import { severityToColor } from '$lib/utils/vulnerabilities';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Vulnerability from '$lib/components/Vulnerability.svelte';
	import {
		Alert,
		Button,
		HelpText,
		Select,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tooltip,
		Tr
	} from '@nais/ds-svelte-community';
	import {
		ArrowCirclepathIcon,
		ChevronLeftIcon,
		ChevronRightIcon,
		FaceFrownIcon,
		FaceIcon,
		FaceSmileIcon,
		SandboxIcon,
		TrendDownIcon,
		TrendFlatIcon,
		TrendUpIcon,
		XMarkOctagonIcon
	} from '@nais/ds-svelte-community/icons';
	import { get } from 'svelte/store';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ TeamVulnerabilities } = data);

	let selectedEnvironment: string = '';

	if (get(page).url.searchParams.has('environment')) {
		selectedEnvironment = get(page).url.searchParams.get('environment') || '';
	}

	$: tableSort = {
		orderBy: $TeamVulnerabilities.variables?.orderBy?.field,
		direction: $TeamVulnerabilities.variables?.orderBy?.direction
	};

	const changeParams = (params: Record<string, string>) => {
		const query = new URLSearchParams(get(page).url.searchParams);
		for (const [key, value] of Object.entries(params)) {
			if (value === '') {
				query.delete(key);
				continue;
			}
			query.set(key, value);
		}
		goto(`?${query.toString()}`);
	};

	const tableSortChange = (e: CustomEvent<{ key: string }>) => {
		const { key } = e.detail;
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = WorkloadOrderField[key as keyof typeof WorkloadOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || WorkloadOrderField.VULNERABILITY_SEVERITY_CRITICAL
		});
	};
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
			<div class="summaryCard" style="align-items: start;">
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
				<div class="summary">
					<h4>
						<span>Vulnerability issues</span>
						<HelpText title="Current team vulnerability status"
							>If any of the workloads have any vulnerability issues, the icon will show a warning
							sign and a details link will show.
						</HelpText>
					</h4>
					<div style="margin-top: 0.5rem;">
						{#if team?.vulnerabilitySummary?.status && team.vulnerabilitySummary.status.filter((status) => status.state !== TeamVulnerabilityState.OK).length > 0}
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
					</div>
				</div>
			</div>
		</Card>
		<Card columns={3} style="display: flex; align-items:center;">
			<div class="summaryCard">
				{#if team !== undefined}
					<div>
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
					</div>
					<div class="summary">
						<h4>
							SBOM coverage
							<HelpText title="Current SBOM coverage">Workloads with an SBOM.</HelpText>
						</h4>
						<p class="metric">
							{team.vulnerabilitySummary.bomCount} of {team.workloads.pageInfo.totalCount}
							workloads
						</p>
					</div>
				{/if}
			</div>
		</Card>
		<Card columns={3} style="display: flex; align-items:center;">
			<div class="summaryCard">
				{#if team !== undefined}
					<div style="--bg-color: #C8C8C8; display:flex; align-items:center;">
						<VulnerabilityBadge
							text={String(team.vulnerabilitySummary.critical)}
							color={severityToColor('critical')}
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
					{#if team.vulnerabilitySummary.riskScoreTrend === TeamVulnerabilityRiskScoreTrend.UP}
						<TrendUpIcon title="RiskScore" font-size="80" style="color: var(--a-icon-danger)" />
					{:else if team.vulnerabilitySummary.riskScoreTrend === TeamVulnerabilityRiskScoreTrend.DOWN}
						<TrendDownIcon title="RiskScore" font-size="80" style="color: var(--a-icon-success)" />
					{:else}
						<TrendFlatIcon title="RiskScore" font-size="80" style="color: var(--a-icon-warning)" />
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
						{team.vulnerabilitySummary.riskScore}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				{#if team !== undefined}
					{#if team.vulnerabilitySummary.ranking === TeamVulnerabilityRanking.MOST_VULNERABLE}
						<div class="summaryIcon" style="--bg-color: #C8C8C8">
							<FaceFrownIcon
								title="Most vulnerable"
								font-size="80"
								style={'color: var(--a-icon-danger)'}
							/>
						</div>
						<div class="summary">
							<h4>
								Team is ranked among the most vulnerable
								<HelpText title="Team ranking"
									>Ranking of the team's risk score compared to other teams. Your team is among the
									most vulnerable teams in the organisation. If you are missing SBOMs on any of your
									workloads this ranking will not be accurate.
								</HelpText>
							</h4>
							<p class="metric"></p>
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
							<h4>
								Team is ranked among the least vulnerable
								<HelpText title="Team ranking"
									>Ranking of the team's risk score compared to other teams. Your team is ranked
									among the least vulnerable teams in the organisation. If you are missing SBOMs on
									any of your workloads this ranking will not be accurate.
								</HelpText>
							</h4>
							<p class="metric"></p>
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
							<h4>
								Team is ranked in the middle
								<HelpText title="Current team ranking"
									>Ranking of the team's risk score compared to other teams. Your team is ranked in
									the middle of your organisations teams. If you are missing SBOMs on any of your
									workloads this ranking will not be accurate.
								</HelpText>
							</h4>
							<p class="metric"></p>
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
							<h4>
								Ranking is unknown
								<HelpText title="Current team ranking"
									>Ranking of the team's risk score compared to other teams. If your ranking is
									unknown this is usually because you are missing SBOMs on your workloads.
								</HelpText>
							</h4>
							<p class="metric"></p>
						</div>
					{/if}
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
						<option value={env.name}>{env.name}</option>
					{/each}
				</Select>
			</div>

			<Table
				zebraStripes
				size="small"
				sort={{
					orderBy: tableSort.orderBy || WorkloadOrderField.VULNERABILITY_SEVERITY_CRITICAL,
					direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
				}}
				on:sortChange={tableSortChange}
			>
				<Thead>
					<Th></Th>
					<Th sortable={true} sortKey={WorkloadOrderField.NAME}>Workload</Th>
					<Th sortable={true} sortKey={WorkloadOrderField.ENVIRONMENT}>Env</Th>
					<Th sortable={true} sortKey={WorkloadOrderField.VULNERABILITY_SEVERITY_CRITICAL}
						>Critical</Th
					>
					<Th sortable={true} sortKey={WorkloadOrderField.VULNERABILITY_SEVERITY_HIGH}>High</Th>
					<Th sortable={true} sortKey={WorkloadOrderField.VULNERABILITY_SEVERITY_MEDIUM}>Medium</Th>
					<Th sortable={true} sortKey={WorkloadOrderField.VULNERABILITY_SEVERITY_LOW}>Low</Th>
					<Th sortable={true} sortKey={WorkloadOrderField.VULNERABILITY_SEVERITY_UNASSIGNED}
						>Unassigned</Th
					>
					<Th sortable={true} sortKey={WorkloadOrderField.VULNERABILITY_RISK_SCORE}>Risk Score</Th>
				</Thead>
				<Tbody>
					{#if team.workloads.nodes.length > 0}
						{@const workloads = team.workloads.nodes}
						{#each workloads as workload}
							<Tr>
								<Td>
									{#if workload.__typename === 'Application'}
										<Tooltip placement="right" content="Application">
											<span style="color:var(--a-gray-600)"><SandboxIcon {...$$restProps} /> </span>
										</Tooltip>
									{:else if workload.__typename === 'Job'}
										<Tooltip placement="right" content="Job">
											<span style="color:var(--a-gray-600)"
												><ArrowCirclepathIcon {...$$restProps} />
											</span>
										</Tooltip>
									{/if}
								</Td>
								<Td>
									<WorkloadLink {workload} />
								</Td>
								<Td>{workload.environment.name}</Td>
								<Td>
									<div class="vulnerability">
										<Vulnerability
											severity="critical"
											count={workload.image.vulnerabilitySummary
												? workload.image.vulnerabilitySummary.critical
												: undefined}
										/>
									</div>
								</Td>
								<Td>
									<div class="vulnerability">
										<Vulnerability
											severity="high"
											count={workload.image.vulnerabilitySummary
												? workload.image.vulnerabilitySummary.high
												: undefined}
										/>
									</div>
								</Td>
								<Td>
									<div class="vulnerability">
										<Vulnerability
											severity="medium"
											count={workload.image.vulnerabilitySummary
												? workload.image.vulnerabilitySummary.medium
												: undefined}
										/>
									</div>
								</Td>
								<Td>
									<div class="vulnerability">
										<Vulnerability
											severity="low"
											count={workload.image.vulnerabilitySummary
												? workload.image.vulnerabilitySummary.low
												: undefined}
										/>
									</div>
								</Td>
								<Td>
									<div class="vulnerability">
										<Vulnerability
											severity="unassigned"
											count={workload.image.vulnerabilitySummary
												? workload.image.vulnerabilitySummary.unassigned
												: undefined}
										/>
									</div>
								</Td>
								<Td>
									<div class="vulnerability">
										<Tooltip
											placement="left"
											content="Calculated based on the number of vulnerabilities, includes unassigned"
										>
											<span class="align-center"
												>{workload.image.vulnerabilitySummary
													? workload.image.vulnerabilitySummary.riskScore
													: '-'}</span
											>
										</Tooltip>
									</div>
								</Td>
							</Tr>
						{/each}
					{:else}
						<Tr>
							<Td colspan={9}>No workloads with vulnerability data found</Td>
						</Tr>
					{/if}
				</Tbody>
			</Table>
			{#if $TeamVulnerabilities.data?.team.workloads.pageInfo.hasPreviousPage || $TeamVulnerabilities.data?.team.workloads.pageInfo.hasNextPage}
				<div class="pagination">
					<span>
						{#if $TeamVulnerabilities.data?.team.workloads.pageInfo.pageStart !== $TeamVulnerabilities.data?.team.workloads.pageInfo.pageEnd}
							{$TeamVulnerabilities.data?.team.workloads.pageInfo.pageStart} - {$TeamVulnerabilities
								.data?.team.workloads.pageInfo.pageEnd}
						{:else}
							{$TeamVulnerabilities.data?.team.workloads.pageInfo.pageStart}
						{/if}

						of {$TeamVulnerabilities.data?.team.workloads.pageInfo.totalCount}
					</span>

					<span style="padding-left: 1rem;">
						<Button
							size="small"
							variant="secondary"
							disabled={!$TeamVulnerabilities.data?.team.workloads.pageInfo.hasPreviousPage}
							on:click={async () => {
								return await TeamVulnerabilities.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!$TeamVulnerabilities.data?.team.workloads.pageInfo.hasNextPage}
							on:click={async () => {
								return await TeamVulnerabilities.loadNextPage();
							}}
						>
							<ChevronRightIcon /></Button
						>
					</span>
				</div>
			{/if}
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

	.vulnerability {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 32px;
	}

	.align-center {
		text-align: center;
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

	.env-filter {
		display: flex;
		margin-bottom: 1rem;
	}

	.summaryIcon {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.summary {
		width: 100%;
	}

	.summary > h4 {
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

	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
