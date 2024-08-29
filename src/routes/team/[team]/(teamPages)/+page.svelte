<script lang="ts">
	import { page } from '$app/stores';
	import { UsageResourceType } from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import TeamStatus from '$lib/components/TeamStatus.svelte';
	import VulnerabilitySummary from '$lib/components/VulnerabilitySummary.svelte';
	import Deploys from '$lib/overview/Deploys.svelte';
	import { euroValueFormatter, percentageFormatter } from '$lib/utils/formatters';
	import { teamUtilization, yearlyOverageCost } from '$lib/utils/resources';
	import { Alert, HelpText, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ Overview } = data);

	$: cpuRequested = $Overview.data?.team?.cpuUtil.reduce(
		(acc, { requested }) => acc + requested,
		0
	);
	$: cpuUsage = $Overview.data?.team?.cpuUtil.reduce((acc, { used }) => acc + used, 0);

	$: memoryRequested = $Overview.data?.team?.memUtil.reduce(
		(acc, { requested }) => acc + requested,
		0
	);
	$: memoryUsage = $Overview.data?.team?.memUtil.reduce((acc, { used }) => acc + used, 0);

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
	<Card rows={1} columns={4}>
		<TeamStatus {teamName} />
	</Card>

	<Card rows={2} columns={3}>
		<VulnerabilitySummary {teamName} /></Card
	>

	<Card rows={2} columns={5}>
		<h4>Utilization</h4>
		<Table size="small" zebraStripes>
			<Thead>
				<Tr>
					<Th>Resource</Th>
					<Th
						><div class="tableHeader">
							Current<HelpText title="Current team utilization"
								>Current CPU and memory utilization for the team's application.<br />Overage cost is
								an annual estimate based on current utilization.</HelpText
							>
						</div></Th
					>
				</Tr>
			</Thead>
			<Tbody>
				<Tr>
					<Td>Memory</Td>
					<Td>
						{percentageFormatter(teamUtilization($Overview.data?.team?.memUtil))}
					</Td>
				</Tr>
				<Tr>
					<Td>CPU</Td>
					<Td>{percentageFormatter(teamUtilization($Overview.data?.team?.cpuUtil))}</Td>
				</Tr>
			</Tbody>
		</Table>
		<p>
			Overage cost:
			{#if cpuRequested && cpuUsage && memoryRequested && memoryUsage}
				{euroValueFormatter(
					yearlyOverageCost(UsageResourceType.CPU, cpuRequested, cpuUsage) +
						yearlyOverageCost(UsageResourceType.MEMORY, memoryRequested, memoryUsage)
				)}
			{/if}
		</p>
		<a href="/team/{teamName}/utilization">View team utilization</a>
	</Card>
	<Card rows={1} columns={4}>
		<Cost app="" env="" team={teamName} />
		<a href="/team/{teamName}/cost">View team costs</a>
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
</style>
