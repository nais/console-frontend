<script lang="ts">
	import { graphql, PendingValue, UtilizationResourceType } from '$houdini';
	import { percentageFormatter } from '$lib/utils/formatters';
	import { teamUtilization, yearlyOverageCost } from '$lib/utils/resources';
	import { Heading, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { AggregatedTeamUtilizationVariables } from './$houdini';
	import Cost from './Cost.svelte';

	export const _AggregatedTeamUtilizationVariables: AggregatedTeamUtilizationVariables = () => {
		return { team: teamSlug };
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

	interface Props {
		teamSlug: string;
	}

	let { teamSlug }: Props = $props();

	let cpuMetrics = $derived($utilization.data?.team.cpuUtil.filter((item) => !!item) ?? []);

	let cpuRequested = $derived(
		cpuMetrics
			.filter((metric) => metric !== PendingValue)
			.reduce((acc, item) => acc + item.requested, 0)
	);

	let cpuUsage = $derived(
		cpuMetrics.filter((metric) => metric !== PendingValue).reduce((acc, item) => acc + item.used, 0)
	);

	let memoryMetrics = $derived($utilization.data?.team?.memUtil.filter((item) => !!item) ?? []);

	let memoryRequested = $derived(
		memoryMetrics
			.filter((metric) => metric !== PendingValue)
			.reduce((acc, item) => acc + item.requested, 0)
	);

	let memoryUsage = $derived(
		memoryMetrics
			.filter((metric) => metric !== PendingValue)
			.reduce((acc, item) => acc + item.used, 0)
	);
</script>

<!--h4 class="container">
	Utilization<HelpText title="Current team utilization"
		>Current CPU and memory utilization for the team's application.<br />Overage cost is an annual
		estimate based on current utilization.</HelpText
	>
</h4-->
<Heading level="4" size="small" spacing>Utilization</Heading>
<Table size="small">
	<Thead>
		<Tr>
			<Th>Resource</Th>
			<Th><div class="tableHeader">Current</div></Th>
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
		<Cost
			cost={yearlyOverageCost(UtilizationResourceType.CPU, cpuRequested, cpuUsage) +
				yearlyOverageCost(UtilizationResourceType.MEMORY, memoryRequested, memoryUsage)}
		/>
	{/if}
</p>
<a href="/team/{teamSlug}/utilization">View team utilization</a>
