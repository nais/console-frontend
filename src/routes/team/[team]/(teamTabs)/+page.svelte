<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import VulnerabilityBadge from '$lib/icons/VulnerabilityBadge.svelte';
	import Deploys from '$lib/overview/Deploys.svelte';
	import { euroValueFormatter, percentageFormatter } from '$lib/utils/formatters';
	import { HelpText, Table, Tbody, Td, Tooltip, Tr } from '@nais/ds-svelte-community';
	import { TrendDownIcon, TrendUpIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ Overview } = data);

	$: vulnerabilities = $Overview.data?.team.vulnerabilitiesSummary;
	$: utilization = $Overview.data?.currentResourceUtilizationForTeam;

	$: teamName = $page.params.team;
	function severityToColor(severity: string) {
		switch (severity) {
			case 'critical':
				return '#f86c6b';
			case 'high':
				return '#fd8b00';
			case 'medium':
				return '#ffc107';
			case 'low':
				return '#4dbd74';
			default:
				return '#777777';
		}
	}
</script>

<div class="grid">
	<Card rows={1} columns={2}>
		<h4>Statuses</h4>
		<p>2 failing apps</p>
		<p>1 failing job</p>
		<p>1337 apss running OK</p>
	</Card>
	<Card rows={1} columns={3}>
		<h4>Vulnerabilities</h4>
		<Tooltip placement="right" content="severity: CRITICAL">
			<VulnerabilityBadge
				text={String(vulnerabilities?.critical)}
				color={severityToColor('critical')}
				size={'38px'}
			/></Tooltip
		>
		<Tooltip placement="right" content="severity: HIGH">
			<VulnerabilityBadge
				text={String(vulnerabilities?.high)}
				color={severityToColor('high')}
				size={'38px'}
			/></Tooltip
		>
		<Tooltip placement="right" content="severity: MEDIUM">
			<VulnerabilityBadge
				text={String(vulnerabilities?.medium)}
				color={severityToColor('medium')}
				size={'38px'}
			/></Tooltip
		>
		<Tooltip placement="right" content="severity: LOW">
			<VulnerabilityBadge
				text={String(vulnerabilities?.low)}
				color={severityToColor('low')}
				size={'38px'}
			/></Tooltip
		>
		<Tooltip placement="right" content="severity: UNASSIGNED">
			<VulnerabilityBadge
				text={String(vulnerabilities?.unassigned)}
				color={severityToColor('unassigned')}
				size={'38px'}
			/></Tooltip
		>
		<p>Risk score for teams applications:<br />{vulnerabilities?.riskScore}</p>
		<a href="/team/{teamName}/vulnerabilities">View all vulnerabilities</a>
	</Card>
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
						<Td style="text-align: right;">{percentageFormatter(utilization.memory.utilization)}</Td
						>
						<Td><TrendUpIcon color={'green'} /> +6%</Td>
						<Td><HelpText title="Utilization trend is negative">Tell me more</HelpText></Td>
					</Tr>
					<Tr>
						<Td>CPU</Td>
						<Td style="text-align: right;">{percentageFormatter(utilization.cpu.utilization)}</Td>
						<Td><TrendDownIcon color={'red'} /> -9%</Td>
						<Td><HelpText title="Utilization trend is negative">Tell me more</HelpText></Td>
					</Tr>
					<Tr>
						<Td>Overage cost</Td>
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
