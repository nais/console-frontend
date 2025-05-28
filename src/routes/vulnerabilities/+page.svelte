<script lang="ts">
	import { page } from '$app/state';
	import { TeamOrderField } from '$houdini';
	import EChart from '$lib/chart/EChart.svelte';
	import { transformVulnerabilities } from '$lib/chart/transformVulnerabilities';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		BodyLong,
		Heading,
		Loader,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		ToggleGroup,
		ToggleGroupItem,
		Tr
	} from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { TenantVulnerabilites } = $derived(data);
	let riskScoreToggle = $state('off');

	let options = $derived(
		transformVulnerabilities(
			$TenantVulnerabilites.data?.imageVulnerabilityHistory,
			riskScoreToggle === 'on'
		)
	);

	let tableSort = $derived({
		orderBy: $TenantVulnerabilites.variables?.orderBy?.field,
		direction: $TenantVulnerabilites.variables?.orderBy?.direction
	});

	let interval = $derived.by(() => {
		const val = page.url.searchParams.get('interval');
		if (val && ['6m', '30d', '7d'].includes(val)) return val;
		return '7d';
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = TeamOrderField[key as keyof typeof TeamOrderField];
			tableSort.direction = 'DESC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || TeamOrderField.SLUG
		});
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
			{#if !$TenantVulnerabilites.fetching && $TenantVulnerabilites.data}
				<div class="toggles">
					<ToggleGroup
						label="Interval"
						value={interval}
						onchange={(interval) => changeParams({ interval }, { noScroll: true })}
					>
						{#each ['6m', '30d', '7d'] as interval (interval)}
							<ToggleGroupItem value={interval}>{interval}</ToggleGroupItem>
						{/each}
					</ToggleGroup>
					<ToggleGroup
						label="Risk score"
						value={riskScoreToggle}
						onchange={(val) => (riskScoreToggle = val)}
					>
						<ToggleGroupItem value="off">Off</ToggleGroupItem>
						<ToggleGroupItem value="on">On</ToggleGroupItem>
					</ToggleGroup>
				</div>
				{#key options}
					<EChart {options} style="height: 500px" />
				{/key}
			{:else}
				<div style="display: flex; justify-content: center; align-items: center; height: 500px;">
					<Loader size="3xlarge" />
				</div>
			{/if}
		</div>

		<div>
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
						<Th sortable={true} sortKey={TeamOrderField.UNASSIGNED_VULNERABILITIES}>Unassgined</Th>
						<Th sortable={true} sortKey={TeamOrderField.RISK_SCORE}>Risk Score</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each $TenantVulnerabilites.data?.teams.nodes ?? [] as team (team.slug)}
						<Tr>
							<Td><a href="/team/{team.slug}/vulnerabilities">{team.slug}</a></Td>
							<Td>{team.vulnerabilitySummary.critical}</Td>
							<Td>{team.vulnerabilitySummary.high}</Td>
							<Td>{team.vulnerabilitySummary.medium}</Td>
							<Td>{team.vulnerabilitySummary.low}</Td>
							<Td>{team.vulnerabilitySummary.unassigned}</Td>
							<Td>{team.vulnerabilitySummary.riskScore}</Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
			{#if $TenantVulnerabilites.data?.teams.pageInfo.hasPreviousPage || $TenantVulnerabilites.data?.teams.pageInfo.hasNextPage}
				<Pagination
					page={$TenantVulnerabilites.data?.teams.pageInfo}
					loaders={{
						loadPreviousPage: () =>
							changeParams({
								after: '',
								before: $TenantVulnerabilites.data?.teams.pageInfo.startCursor ?? ''
							}),
						loadNextPage: () =>
							changeParams({
								after: $TenantVulnerabilites.data?.teams.pageInfo.endCursor ?? '',
								before: ''
							})
					}}
				/>
			{/if}
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
	.toggles {
		display: flex;
		gap: var(--spacing-layout);
		flex-direction: row;
		justify-content: flex-end;
	}
</style>
