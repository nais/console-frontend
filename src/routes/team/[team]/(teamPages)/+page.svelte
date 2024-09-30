<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	/*import ActivityLog from '$lib/components/ActivityLog.svelte';*/
	import { UtilizationResourceType } from '$houdini/graphql';
	import ActivityLog from '$lib/components/ActivityLog.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { euroValueFormatter, percentageFormatter } from '$lib/utils/formatters';
	import { teamUtilization, yearlyOverageCost } from '$lib/utils/resources';
	import { Alert, HelpText, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import VulnerabilitySummary from '$lib/components/VulnerabilitySummary.svelte';

	export let data: PageData;
	$: ({ Overview } = data);

	$: cpuMetrics = $Overview.data?.team?.cpuUtil.filter((item) => !!item) ?? [];

	$: cpuRequested = cpuMetrics.reduce((acc, item) => acc + item.requested, 0);

	$: cpuUsage = cpuMetrics.reduce((acc, item) => acc + item.used, 0);

	$: memoryMetrics = $Overview.data?.team?.memUtil.filter((item) => !!item) ?? [];

	$: memoryRequested = memoryMetrics.reduce((acc, item) => acc + item.requested, 0);

	$: memoryUsage = memoryMetrics.reduce((acc, item) => acc + item.used, 0);

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
		<!--TeamStatus {teamName} /-->
		TODO: TeamStatus
	</Card>

	<Card rows={2} columns={3}>
		<VulnerabilitySummary {teamName} />
	</Card>

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
						{percentageFormatter(teamUtilization(memoryMetrics))}
					</Td>
				</Tr>
				<Tr>
					<Td>CPU</Td>
					<Td>
						{percentageFormatter(teamUtilization(cpuMetrics))}
					</Td>
				</Tr>
			</Tbody>
		</Table>
		<p>
			Overage cost:
			{#if cpuRequested && cpuUsage && memoryRequested && memoryUsage}
				{euroValueFormatter(
					yearlyOverageCost(UtilizationResourceType.CPU, cpuRequested, cpuUsage) +
						yearlyOverageCost(UtilizationResourceType.MEMORY, memoryRequested, memoryUsage)
				)}
			{/if}
		</p>
		<a href="/team/{teamName}/utilization">View team utilization</a>
	</Card>
	<Card rows={1} columns={4}>
		<h4>Cost</h4>
		<Cost team={teamName} />

		<p><a href="/team/{teamName}/cost">View team costs</a></p>
	</Card>

	<Card rows={1} columns={12}>
		<h4>Deployments</h4>

		TODO: Deployments
		<!--Deploys {teamName} /-->
	</Card>

	<ActivityLog {teamName} columns={12} />
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
