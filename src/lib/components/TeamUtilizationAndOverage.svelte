<script lang="ts">
	import { graphql, PendingValue, UtilizationResourceType } from '$houdini';
	import { euroValueFormatter, percentageFormatter } from '$lib/utils/formatters';
	import { teamUtilization, yearlyOverageCost } from '$lib/utils/resources';
	import { HelpText, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { AggregatedTeamUtilizationVariables } from './$houdini';

	export const _AggregatedTeamUtilizationVariables: AggregatedTeamUtilizationVariables = () => {
		return { team: teamName };
	};

	const utilization = graphql(`
		query AggregatedTeamUtilization($team: Slug!) @load {
			team(slug: $team) @loading {
				cpuUtil: workloadUtilization(resourceType: CPU) @loading {
					requested
					used
					workload {
						name
						environment {
							name
						}
					}
				}
				memUtil: workloadUtilization(resourceType: MEMORY) @loading {
					requested
					used
					workload {
						name
						environment {
							name
						}
					}
				}
			}
		}
	`);

	export let teamName: string;

	$: cpuMetrics = $utilization.data?.team.cpuUtil.filter((item) => !!item) ?? [];

	$: cpuRequested = cpuMetrics
		.filter((metric) => metric !== PendingValue)
		.reduce((acc, item) => acc + item.requested, 0);

	$: cpuUsage = cpuMetrics
		.filter((metric) => metric !== PendingValue)
		.reduce((acc, item) => acc + item.used, 0);

	$: memoryMetrics = $utilization.data?.team?.memUtil.filter((item) => !!item) ?? [];

	$: memoryRequested = memoryMetrics
		.filter((metric) => metric !== PendingValue)
		.reduce((acc, item) => acc + item.requested, 0);

	$: memoryUsage = memoryMetrics
		.filter((metric) => metric !== PendingValue)
		.reduce((acc, item) => acc + item.used, 0);
</script>

<h4>Utilization</h4>
<Table size="small" zebraStripes>
	<Thead>
		<Tr>
			<Th>Resource</Th>
			<Th
				><div class="tableHeader">
					Current<HelpText title="Current team utilization"
						>Current CPU and memory utilization for the team's application.<br />Overage cost is an
						annual estimate based on current utilization.</HelpText
					>
				</div></Th
			>
		</Tr>
	</Thead>
	<Tbody>
		<Tr>
			<Td>Memory</Td>
			<Td>
				{#if memoryMetrics.length > 0}
					{#if memoryMetrics[0] !== PendingValue}
						{percentageFormatter(teamUtilization(memoryMetrics))}
					{:else}
						<Skeleton variant="text" />
					{/if}
				{:else}
					-
				{/if}
			</Td>
		</Tr>
		<Tr>
			<Td>CPU</Td>
			<Td>
				{#if cpuMetrics.length > 0}
					{#if cpuMetrics[0] !== PendingValue}
						{percentageFormatter(teamUtilization(cpuMetrics))}
					{:else}
						<Skeleton variant="text" />
					{/if}
				{:else}
					-
				{/if}
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
