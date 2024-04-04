<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import TeamStatus from '$lib/components/TeamStatus.svelte';
	import VulnerabilitySummary from '$lib/components/VulnerabilitySummary.svelte';
	import Deploys from '$lib/overview/Deploys.svelte';
	import { euroValueFormatter, percentageFormatter } from '$lib/utils/formatters';
	import {
		Alert,
		HelpText,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import { TrendDownIcon, TrendUpIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ Overview } = data);

	$: utilization = $Overview.data?.currentResourceUtilizationForTeam;
	$: trend = $Overview.data?.resourceUtilizationTrendForTeam;

	$: teamName = $page.params.team;
</script>

{#if $Overview.errors}
	<GraphErrors errors={$Overview.errors} />
{/if}
{#if $page.url.searchParams.has('deleted')}
	{@const msgParts = ($page.url.searchParams.get('deleted') || '').split('/')}
	<Alert variant="success" size="small">
		Successfully deleted {msgParts[0]}
		{msgParts[1]}.
	</Alert>
{/if}

<div class="grid">
	<Card rows={2} columns={3}>
		<TeamStatus {teamName} />
	</Card>
	<Card rows={2} columns={3}>
		<VulnerabilitySummary {teamName} /></Card
	>
	<Card rows={1} columns={6}>
		<Cost app="" env="" team={teamName} />
		<a href="/team/{teamName}/cost">View team costs</a>
	</Card>
	<Card rows={1} columns={6}>
		<h4>Utilization</h4>
		{#if utilization}
			<Table>
				<Thead>
					<Tr>
						<Th>Resource</Th>
						<Th
							><div class="tableHeader">
								Current<HelpText title="Current team utilization"
									>Current CPU and memory utilization for the team's application.<br />Overage cost
									is an annual estimate based on current utilization.</HelpText
								>
							</div></Th
						>
						<Th
							><div class="tableHeader">
								Trend<HelpText title="Utilization trend"
									>Utilization trend for the team's application based on last weeks average.</HelpText
								>
							</div></Th
						>
					</Tr>
				</Thead>
				<Tbody>
					<Tr>
						<Td>Memory</Td>
						{#if utilization && utilization === PendingValue}
							<Td><Skeleton variant="text" width="100px" /></Td>
							<Td><Skeleton variant="text" width="100px" /></Td>
							<Td><Skeleton variant="text" width="100px" /></Td>
						{:else}
							<Td>
								{percentageFormatter(utilization.memory.utilization)}
							</Td>
							{#if trend && trend !== PendingValue}
								{#if trend.memoryUtilizationTrend < 0.0}
									<Td>
										<div class="trend bad">
											<TrendDownIcon />
											{trend.memoryUtilizationTrend.toLocaleString('en-GB', {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2
											}) + '%'}
										</div>
									</Td>
								{:else}
									<Td>
										<div class="trend good">
											<TrendUpIcon />{trend.memoryUtilizationTrend.toLocaleString('en-GB', {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2
											}) + '%'}
										</div>
									</Td>
								{/if}
							{/if}
						{/if}
					</Tr>
					<Tr>
						<Td>CPU</Td>
						{#if utilization && utilization === PendingValue}
							<Td><Skeleton variant="text" width="100px" /></Td>
							<Td><Skeleton variant="text" width="100px" /></Td>
							<Td><Skeleton variant="text" width="100px" /></Td>
						{:else}
							<Td>{percentageFormatter(utilization.cpu.utilization)}</Td>
							{#if trend && trend !== PendingValue}
								{#if trend.cpuUtilizationTrend < 0.0}
									<Td>
										<div class="trend bad">
											<TrendDownIcon />{trend.cpuUtilizationTrend.toLocaleString('en-GB', {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2
											}) + '%'}
										</div></Td
									>
								{:else}
									<Td
										><div class="trend good">
											<TrendUpIcon />{trend.cpuUtilizationTrend.toLocaleString('en-GB', {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2
											}) + '%'}
										</div></Td
									>
								{/if}
							{/if}
						{/if}
					</Tr>

					{#if utilization && utilization === PendingValue}
						<p>Overage cost: <Skeleton variant="text" width="100px" /></p>
					{:else}
						<p>
							Overage cost:
							{euroValueFormatter(
								utilization.cpu.estimatedAnnualOverageCost +
									utilization.memory.estimatedAnnualOverageCost
							)}
						</p>
					{/if}
					<a href="/team/{teamName}/utilization">View team utilization</a>
				</Tbody>
			</Table>
		{/if}
	</Card>
	<Card rows={1} columns={12}>
		<h4>Deployments</h4>
		<Deploys {teamName} />
	</Card>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	.grid:not(:first-child) {
		margin-top: 1rem;
	}
	.tableHeader {
		display: flex;
		gap: 0.5rem;
	}
	.trend {
		display: flex;
		gap: 0.5rem;
	}
	.good {
		color: var(--a-icon-success);
	}
	.bad {
		color: var(--a-icon-danger);
	}
</style>
