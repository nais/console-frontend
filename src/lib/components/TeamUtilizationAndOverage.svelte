<script lang="ts">
	import { graphql, UtilizationResourceType } from '$houdini';
	import { euroValueFormatter, percentageFormatter } from '$lib/utils/formatters';
	import { teamUtilization, yearlyOverageCost } from '$lib/utils/resources';
	import {
		BodyShort,
		Heading,
		HelpText,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';

	const utilization = graphql(`
		query AggregatedTeamUtilization($team: Slug!) {
			currentUnitPrices {
				cpu {
					value
				}
				memory {
					value
				}
			}
			team(slug: $team) {
				cpuUtil: workloadUtilization(resourceType: CPU) {
					requested
					used
					workload {
						name
						teamEnvironment {
							environment {
								name
							}
						}
					}
				}
				memUtil: workloadUtilization(resourceType: MEMORY) {
					requested
					used
					workload {
						name
						teamEnvironment {
							environment {
								name
							}
						}
					}
				}
			}
		}
	`);

	$effect.pre(() => {
		utilization.fetch({
			variables: {
				team: teamSlug
			}
		});
	});

	interface Props {
		teamSlug: string;
	}

	let { teamSlug }: Props = $props();

	let cpuMetrics = $derived($utilization.data?.team.cpuUtil.filter((item) => !!item) ?? []);

	let cpuRequested = $derived(cpuMetrics.reduce((acc, item) => acc + item.requested, 0));

	let cpuUsage = $derived(cpuMetrics.reduce((acc, item) => acc + item.used, 0));

	let memoryMetrics = $derived($utilization.data?.team?.memUtil.filter((item) => !!item) ?? []);

	let memoryRequested = $derived(memoryMetrics.reduce((acc, item) => acc + item.requested, 0));

	let memoryUsage = $derived(memoryMetrics.reduce((acc, item) => acc + item.used, 0));

	let prices = $derived($utilization.data?.currentUnitPrices);
</script>

<div class="wrapper">
	<div class="header">
		<Heading level="4" size="small">Utilization</Heading>
		<HelpText title="Current team utilization"
			>Current CPU and memory utilization for the team's application. Overage cost is an annual
			estimate based on current utilization.</HelpText
		>
	</div>
	<Table>
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
						{#if !$utilization.fetching}
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
						{#if !$utilization.fetching}
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
	<BodyShort>
		Overage cost:
		{#if cpuRequested && cpuUsage && memoryRequested && memoryUsage && prices}
			{euroValueFormatter(
				yearlyOverageCost(
					UtilizationResourceType.CPU,
					cpuRequested - cpuUsage,
					prices.cpu.value,
					prices.memory.value
				) +
					yearlyOverageCost(
						UtilizationResourceType.MEMORY,
						memoryRequested - memoryUsage,
						prices.cpu.value,
						prices.memory.value
					)
			)}
		{/if}
	</BodyShort>
	<a href="/team/{teamSlug}/utilization" style:margin-top="auto" style:align-self="end"
		>View Team Utilization</a
	>
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		min-height: 100%;
	}

	.header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
</style>
