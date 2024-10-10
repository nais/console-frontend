<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue, type TeamVulnerabilities$result, VulnerabilityState } from '$houdini';
	import {
		OrderByField,
		VulnerabilityRankingTrend,
		type OrderByField$options
	} from '$houdini/graphql';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Vulnerability from '$lib/components/Vulnerability.svelte';
	import {
		changeParams,
		sortTable,
		tableGraphDirection,
		tableStateFromVariables
	} from '$lib/pagination';
	import {
		Alert,
		HelpText,
		Select,
		Skeleton,
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
		SandboxIcon,
		XMarkOctagonIcon,
		TrendUpIcon,
		TrendDownIcon,
		TrendFlatIcon,
		VitalsIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
	import Nais from '$lib/icons/Nais.svelte';
	import VulnerabilityBadge from '$lib/icons/VulnerabilityBadge.svelte';
	import { severityToColor } from '$lib/utils/vulnerabilities';

	export let data: PageData;
	$: ({ TeamVulnerabilities } = data);
	$: team = $TeamVulnerabilities.data?.team;

	$: teamName = $page.params.team;

	let defaultSortCol: OrderByField$options = OrderByField.RISK_SCORE;
	let defaultSortDir: 'descending' | 'ascending' = 'descending';

	$: ({ sortState, limit, offset } = tableStateFromVariables(
		$TeamVulnerabilities.variables,
		defaultSortCol,
		defaultSortDir
	));

	const sortChange = (e: CustomEvent<{ key: string }>) => {
		const { key } = e.detail;
		const ss = sortTable(key, sortState);
		defaultSortCol = ss.orderBy as OrderByField$options;
		defaultSortDir = ss.direction;
		changeParams({ col: ss.orderBy, dir: tableGraphDirection[ss.direction] });
	};

	let selectedEnvironment: string = '';

	const workloadLink = (
		node: TeamVulnerabilities$result['team']['vulnerabilities']['nodes'][number]
	) => {
		if (node.workloadType === 'app') {
			return `/team/${teamName}/${node.env}/app/${node.workloadName}/image`;
		} else if (node.workloadType === 'job') {
			return `/team/${teamName}/${node.env}/job/${node.workloadName}/image`;
		}
	};

	const isTooVulnerable = (
		summary: TeamVulnerabilities$result['team']['vulnerabilitiesSummary']
	) => {
		return summary.status.some((s) => s.state === VulnerabilityState.TOO_MANY_VULNERABLE_WORKLOADS);
	};
</script>

{#if $TeamVulnerabilities.errors}
	<Alert variant="error">
		{#each $TeamVulnerabilities.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else}
	<div class="grid">
		<Card columns={12}>
			{#if team !== undefined && team.id !== PendingValue}
				<div class="summaryCard" style="align-items: start;">
					{#if team.vulnerabilitiesSummary.status.filter((status) => status.state !== 'OK').length > 0}
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
							Vulnerability issues
							<HelpText title="Current team vulnerability status"
								>If any of the workloads have any vulnerability issues, the icon will show a warning
								sign and a details link will show.
							</HelpText>
						</h4>
						<div style="margin-top: 0.5rem;">
							{#if team.vulnerabilitiesSummary.status.filter((status) => status.state !== VulnerabilityState.OK).length > 0}
								<details>
									<summary style="font-size: 1rem; var(--color-text-secondary);"
										>Show details</summary
									>
									{#each team.vulnerabilitiesSummary.status.filter((status) => status.state !== VulnerabilityState.OK) as status}
										<div class="wrapper">
											<Alert variant="error">
												<h4>{status.title}</h4>
												{status.description}
											</Alert>
										</div>
									{/each}
								</details>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</Card>
		<Card columns={3} style="display: flex; align-items:center;">
			<div class="summaryCard">
				{#if team !== undefined && team.id !== PendingValue}
					<div>
						{#if team.vulnerabilitiesSummary.coverage >= 100}
							<Nais
								size="66px"
								style="color: var(--a-icon-success)"
								aria-label="Workload is nais"
								role="image"
							/>
						{:else}
							<CircleProgressBar
								size="66px"
								progress={team.vulnerabilitiesSummary.coverage / 100}
								startColor="red"
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
							{team.vulnerabilitiesSummary.bomCount} of {team.vulnerabilitiesSummary.totalWorkloads}
							workloads
						</p>
					</div>
				{/if}
			</div>
		</Card>
		<Card columns={3} style="display: flex; align-items:center;">
			<div class="summaryCard">
				{#if team !== undefined && team.id !== PendingValue}
					<div style="--bg-color: #C8C8C8; display:flex; align-items:center;">
						<VulnerabilityBadge
							text={String(team.vulnerabilitiesSummary.critical)}
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
				{#if team !== undefined && team.id !== PendingValue}
					<div class="summaryIcon" style="--bg-color: #C8C8C8">
						<VitalsIcon
							title="RiskScore"
							font-size="80"
							style={isTooVulnerable(team.vulnerabilitiesSummary)
								? 'color: var(--a-icon-danger)'
								: 'color: var(--a-icon-success)'}
						/>
					</div>
					<div class="summary">
						<h4>
							Total risk score
							<HelpText title="Current team total risk score"
								>The total risk score for the team's vulnerabilities.
							</HelpText>
						</h4>
						<p class="metric">
							{team.vulnerabilitiesSummary.riskScore}
						</p>
					</div>
				{/if}
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				{#if team !== undefined && team.id !== PendingValue}
					<div class="summaryIcon" style="--bg-color: #C8C8C8">
						{#if team.vulnerabilitiesSummary.teamRanking.trend === VulnerabilityRankingTrend.DOWN}
							<TrendDownIcon
								title="RiskScore"
								font-size="80"
								style={'color: var(--a-icon-success)'}
							/>
						{:else if team.vulnerabilitiesSummary.teamRanking.trend === VulnerabilityRankingTrend.UP}
							<TrendUpIcon title="RiskScore" font-size="80" style={'color: var(--a-icon-danger)'} />
						{:else}
							<TrendFlatIcon title="RiskScore" font-size="80" style={'color: var(--a-icon-info)'} />
						{/if}
					</div>
					<div class="summary">
						<h4>
							Riskscore ranking
							<HelpText title="Current team ranking"
								>Ranking of the team's risk score compared to other teams. 1st place means overall
								highest riskscore. The icon will also show trend up or down since last month. If you
								are missing SBOMs on any of your workloads this ranking will not be accurate.
							</HelpText>
						</h4>
						<p class="metric">
							#{team.vulnerabilitiesSummary.teamRanking.rank} of {team.vulnerabilitiesSummary
								.teamRanking.totalTeams} teams
						</p>
					</div>
				{/if}
			</div>
		</Card>
		<Card columns={12}>
			<h4>Workloads with SBOM</h4>
			{#if team !== undefined && team.id !== PendingValue}
				<div class="env-filter">
					<Select
						size="small"
						hideLabel={true}
						bind:value={selectedEnvironment}
						on:change={() => {
							changeParams({ env: selectedEnvironment });
						}}
						label="Environment"
					>
						<option value="">All environments</option>
						{#each team.environments as env}
							<option value={env.name}>{env.name}</option>
						{/each}
					</Select>
				</div>
			{/if}

			<Table size="small" sort={sortState} on:sortChange={sortChange}>
				<Thead>
					<Th></Th>
					<Th sortable={true} sortKey={OrderByField.NAME}>Workload</Th>
					<Th sortable={true} sortKey={OrderByField.ENV}>Env</Th>
					<Th sortable={true} sortKey={OrderByField.SEVERITY_CRITICAL}>Critical</Th>
					<Th sortable={true} sortKey={OrderByField.SEVERITY_HIGH}>High</Th>
					<Th sortable={true} sortKey={OrderByField.SEVERITY_MEDIUM}>Medium</Th>
					<Th sortable={true} sortKey={OrderByField.SEVERITY_LOW}>Low</Th>
					<Th sortable={true} sortKey={OrderByField.SEVERITY_UNASSIGNED}>Unassigned</Th>
					<Th sortable={true} sortKey={OrderByField.RISK_SCORE}>Risk Score</Th>
				</Thead>
				<Tbody>
					{#if team !== undefined}
						{#if team.id === PendingValue}
							<Tr>
								{#each new Array(8).fill('text') as variant}
									<Td>
										<Skeleton height="32px" {variant} />
									</Td>
								{/each}
							</Tr>
						{:else}
							{#each team.vulnerabilities.nodes as node}
								<Tr>
									<Td>
										{#if node.workloadType === 'app'}
											<span style="color:var(--a-gray-600)"><SandboxIcon {...$$restProps} /> </span>
										{:else if node.workloadType === 'job'}
											<span style="color:var(--a-gray-600)"
												><ArrowCirclepathIcon {...$$restProps} />
											</span>
										{/if}
									</Td>
									<Td>
										<a href={workloadLink(node)}>{node.workloadName}</a>
									</Td>
									<Td>{node.env}</Td>
									{#if node.summary !== null}
										<Td>
											<div class="vulnerability">
												<Vulnerability severity="critical" count={node.summary.critical} />
											</div>
										</Td>
										<Td>
											<div class="vulnerability">
												<Vulnerability severity="high" count={node.summary.high} />
											</div>
										</Td>
										<Td>
											<div class="vulnerability">
												<Vulnerability severity="medium" count={node.summary.medium} />
											</div>
										</Td>
										<Td>
											<div class="vulnerability">
												<Vulnerability severity="low" count={node.summary.low} />
											</div>
										</Td>
										<Td>
											<div class="vulnerability">
												<Vulnerability severity="unassigned" count={node.summary.unassigned} />
											</div>
										</Td>
										<Td>
											<div class="vulnerability">
												<Tooltip
													placement="left"
													content="Calculated based on the number of vulnerabilities, includes unassigned"
												>
													<span class="na">{node.summary.riskScore}</span>
												</Tooltip>
											</div>
										</Td>
									{:else}
										<Td>
											<div class="na">-</div>
										</Td>
										<Td>
											<div class="na">-</div>
										</Td>
										<Td>
											<div class="na">-</div>
										</Td>
										<Td>
											<div class="na">-</div>
										</Td>
										<Td>
											<div class="na">-</div>
										</Td>
										<Td>
											<div class="na">-</div>
										</Td>
									{/if}
								</Tr>
							{/each}
						{/if}
					{:else}
						<Tr>
							<Td colspan={9}>No workloads with vulnerability data found</Td>
						</Tr>
					{/if}
				</Tbody>
			</Table>
			<Pagination
				pageInfo={team?.vulnerabilities.pageInfo}
				{limit}
				{offset}
				changePage={(e) => {
					changeParams({ page: e.toString() });
				}}
			/>
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
		line-height: 0.6;
	}

	.na {
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
</style>
