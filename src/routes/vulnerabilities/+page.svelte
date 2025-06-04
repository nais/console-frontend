<script lang="ts">
	import { page } from '$app/state';
	import { TeamOrderField } from '$houdini';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		BodyLong,
		Heading,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';
	import VulnerabilityHistory from './VulnerabilityHistory.svelte';
	import VulnerabilityLeaderBoard from './VulnerabilityLeaderBoard.svelte';

	let { data }: PageProps = $props();
	let { TenantVulnerabilites, mostVulnerableTeamsDirection, mostVulnerableTeamsField } =
		$derived(data);

	let tableSort = $derived({
		orderBy: $TenantVulnerabilites.variables?.orderBy?.field,
		direction: $TenantVulnerabilites.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = TeamOrderField[key as keyof typeof TeamOrderField];
			tableSort.direction = 'DESC';
		}

		changeParams(
			{
				direction: tableSort.direction,
				field: tableSort.orderBy || TeamOrderField.SLUG,
				after: '',
				before: ''
			},
			{ noScroll: true }
		);
	};
</script>

<div class="container">
	<div class="wrapper">
		<GraphErrors errors={$TenantVulnerabilites.errors} />

		<div class="graph">
			<div class="heading">
				<div class="content">
					<Heading level="2" spacing
						>Vulnerabilities for <strong>{page.data.tenantName?.toUpperCase()}</strong></Heading
					>
					<BodyLong>
						This stacked line chart displays the accumulation of image vulnerabilities over time,
						categorized by severity level. Use the interval selector to adjust the time range.
						Enable the Risk Score toggle to weight each severity by its impact.
					</BodyLong>
				</div>
			</div>
			<VulnerabilityHistory />
		</div>
		<VulnerabilityLeaderBoard {mostVulnerableTeamsDirection} {mostVulnerableTeamsField} />

		<div>
			<Heading level="3" spacing>Team Security Posture</Heading>
			<BodyLong>
				A detailed breakdown of all teams, showing the number of vulnerabilities by severity, total
				risk score, SBOM coverage, and workload count. Use this table to explore and compare
				security posture across teams.
			</BodyLong>
			<Table
				size="small"
				sort={{
					orderBy: tableSort.orderBy || TeamOrderField.SLUG,
					direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
				}}
				onsortchange={tableSortChange}
			>
				<Thead>
					<Tr>
						<Th sortable={true} sortKey={TeamOrderField.SLUG}>Team</Th>
						<Th sortable={true} sortKey={TeamOrderField.CRITICAL_VULNERABILITIES}>Critical</Th>
						<Th sortable={true} sortKey={TeamOrderField.HIGH_VULNERABILITIES}>High</Th>
						<Th sortable={true} sortKey={TeamOrderField.MEDIUM_VULNERABILITIES}>Medium</Th>
						<Th sortable={true} sortKey={TeamOrderField.LOW_VULNERABILITIES}>Low</Th>
						<Th sortable={true} sortKey={TeamOrderField.UNASSIGNED_VULNERABILITIES}>Unassigned</Th>
						<Th sortable={true} sortKey={TeamOrderField.RISK_SCORE}>Risk Score</Th>
						<Th sortable={true} sortKey={TeamOrderField.SBOM_COVERAGE}>Coverage</Th>
						<Th># of Workloads</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#if $TenantVulnerabilites.fetching}
						{#each Array(20).fill('text') as tr, i (i)}
							<Tr>
								{#each Array(9).fill(tr) as variant, i (i)}
									<Td height="2rem"><Skeleton {variant} /></Td>
								{/each}
							</Tr>
						{/each}
					{:else}
						{#each $TenantVulnerabilites.data?.teams.nodes ?? [] as team (team.slug)}
							<Tr>
								<Td height="2rem"><a href="/team/{team.slug}/vulnerabilities">{team.slug}</a></Td>
								<Td style="text-align: right">{team.vulnerabilitySummary.critical}</Td>
								<Td style="text-align: right">{team.vulnerabilitySummary.high}</Td>
								<Td style="text-align: right">{team.vulnerabilitySummary.medium}</Td>
								<Td style="text-align: right">{team.vulnerabilitySummary.low}</Td>
								<Td style="text-align: right">{team.vulnerabilitySummary.unassigned}</Td>
								<Td style="text-align: right">{team.vulnerabilitySummary.riskScore}</Td>
								<Td style="text-align: right"
									>{team.vulnerabilitySummary.coverage.toLocaleString('en-GB', {
										minimumFractionDigits: 0,
										maximumFractionDigits: 0
									})}%</Td
								>
								<Td style="text-align: right">{team.workloads.pageInfo.totalCount}</Td>
							</Tr>
						{/each}
					{/if}
				</Tbody>
			</Table>
			<Pagination
				page={$TenantVulnerabilites.data?.teams.pageInfo}
				fetching={$TenantVulnerabilites.fetching}
				loaders={{
					loadPreviousPage: () =>
						changeParams(
							{
								after: '',
								before: $TenantVulnerabilites.data?.teams.pageInfo.startCursor ?? ''
							},
							{ noScroll: true }
						),
					loadNextPage: () =>
						changeParams(
							{
								after: $TenantVulnerabilites.data?.teams.pageInfo.endCursor ?? '',
								before: ''
							},
							{ noScroll: true }
						)
				}}
			/>
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		margin-top: var(--spacing-layout);
	}
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.graph {
		display: flex;
		flex-direction: column;
	}

	.heading {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--spacing-layout);
		padding-bottom: var(--spacing-layout);
	}

	.content {
		max-width: 80ch;
	}
</style>
