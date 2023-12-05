<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import TeamStatus from '$lib/components/TeamStatus.svelte';
	import VulnerabilitySummary from '$lib/components/VulnerabilitySummary.svelte';
	import Deploys from '$lib/overview/Deploys.svelte';
	import { euroValueFormatter, percentageFormatter } from '$lib/utils/formatters';
	import { HelpText, Skeleton, Table, Tbody, Td, Tr } from '@nais/ds-svelte-community';
	import { TrendDownIcon, TrendUpIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ Overview } = data);

	$: utilization = $Overview.data?.currentResourceUtilizationForTeam;

	$: teamName = $page.params.team;
</script>

<div class="grid">
	<Card rows={1} columns={2}>
		<TeamStatus {teamName} />
	</Card>
	<Card rows={1} columns={3}>
		<VulnerabilitySummary {teamName} /></Card
	>
	<Card rows={6} columns={7}>
		<h4>Deployments</h4>
		<Deploys {teamName} />
	</Card>

	<Card rows={1} columns={5}>
		<Cost app="" env="" team={teamName} />
		<a href="/team/{teamName}/cost">View team costs</a>
	</Card>

	<Card rows={1} columns={5}>
		<h4>Utilization</h4>
		{#if utilization}
			<Table>
				<Tbody>
					<Tr>
						<Td>Memory</Td>
						{#if utilization && utilization === PendingValue}
							<Td style="text-align: right;"><Skeleton variant="text" width="100px" /></Td>
							<Td style="text-align: right;"><Skeleton variant="text" width="100px" /></Td>
							<Td style="text-align: right;"><Skeleton variant="text" width="100px" /></Td>
						{:else}
							<Td style="text-align: right;"
								>{percentageFormatter(utilization.memory.utilization)}</Td
							>
							<Td><TrendUpIcon color={'green'} /> +6%</Td>
							<Td><HelpText title="Utilization trend is negative">Tell me more</HelpText></Td>
						{/if}
					</Tr>
					<Tr>
						<Td>CPU</Td>
						{#if utilization && utilization === PendingValue}
							<Td style="text-align: right;"><Skeleton variant="text" width="100px" /></Td>
							<Td style="text-align: right;"><Skeleton variant="text" width="100px" /></Td>
							<Td style="text-align: right;"><Skeleton variant="text" width="100px" /></Td>
						{:else}
							<Td style="text-align: right;">{percentageFormatter(utilization.cpu.utilization)}</Td>
							<Td><TrendDownIcon color={'red'} /> -9%</Td>
							<Td><HelpText title="Utilization trend is negative">Tell me more</HelpText></Td>
						{/if}
					</Tr>
					<Tr>
						<Td>Overage cost</Td>
						{#if utilization && utilization === PendingValue}
							<Td style="text-align: right;"><Skeleton variant="text" width="100px" /></Td>
							<Td style="text-align: right;"><Skeleton variant="text" width="100px" /></Td>
							<Td style="text-align: right;"><Skeleton variant="text" width="100px" /></Td>
						{:else}
							<Td style="text-align: right;"
								>{euroValueFormatter(
									utilization.cpu.estimatedAnnualOverageCost +
										utilization.memory.estimatedAnnualOverageCost
								)}</Td
							>
							<Td />
							<Td>
								<HelpText title="Estimated annual overage cost"
									>Estimate of yearly cost with current utilization of CPU and memory requests.</HelpText
								>
							</Td>
						{/if}
					</Tr>
				</Tbody>
			</Table>
		{/if}
	</Card>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
</style>
