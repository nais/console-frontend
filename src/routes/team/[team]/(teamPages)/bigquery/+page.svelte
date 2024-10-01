<script lang="ts">
	import { page } from '$app/stores';
	import { BigQueryDatasetOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';

	import { goto } from '$app/navigation';
	import { resourceLink } from '$lib/utils/links';
	import { Alert, Button, Link, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import { get } from 'svelte/store';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ BigQuery } = data);

	$: tableSort = {
		orderBy: $BigQuery.variables?.orderBy?.field,
		direction: $BigQuery.variables?.orderBy?.direction
	};

	const changeParams = (params: Record<string, string>) => {
		const query = new URLSearchParams(get(page).url.searchParams);
		for (const [key, value] of Object.entries(params)) {
			query.set(key, value);
		}
		goto(`?${query.toString()}`);
	};

	const tableSortChange = (e: CustomEvent<{ key: string }>) => {
		const { key } = e.detail;
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = BigQueryDatasetOrderField[key as keyof typeof BigQueryDatasetOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || 'NAME'
		});
	};

	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $BigQuery.errors}
	{#each distinctErrors($BigQuery.errors) as error}
		<Alert variant="error">
			{error}
		</Alert>
	{/each}
{:else if $BigQuery.data}
	<Card columns={12}>
		<Table
			size="small"
			zebraStripes
			sort={{
				orderBy: tableSort.orderBy || 'NAME',
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			on:sortChange={tableSortChange}
		>
			<Thead>
				<Th sortable={true} sortKey="NAME">Name</Th>
				<Th sortable={true} sortKey="ENVIRONMENT">Env</Th>
				<Th>Owner</Th>
			</Thead>
			<Tbody>
				{#each $BigQuery.data.team.bigQueryDatasets.edges as edge}
					<Tr>
						<Td>
							<Link
								href={resourceLink(
									edge.node.environment.name,
									teamName,
									'bigquery',
									edge.node.name
								)}>{edge.node.name}</Link
							>
						</Td>
						<Td>
							{edge.node.environment.name}
						</Td>
						<Td>
							{#if edge.node.workload}
								<WorkloadLink
									workload={edge.node.workload}
									env={edge.node.environment.name}
									team={teamName}
								/>
							{:else}
								<em>No owner</em>
							{/if}
						</Td>
					</Tr>
				{:else}
					<Tr>
						<Td colspan={999}>No BigQuery s found</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
		{#if $BigQuery.data?.team.bigQueryDatasets.pageInfo.hasPreviousPage || $BigQuery.data?.team.bigQueryDatasets.pageInfo.hasNextPage}
			<div class="pagination">
				<span>
					{#if $BigQuery.data.team.bigQueryDatasets.pageInfo.pageStart !== $BigQuery.data.team.bigQueryDatasets.pageInfo.pageEnd}
						{$BigQuery.data.team.bigQueryDatasets.pageInfo.pageStart} - {$BigQuery.data.team
							.bigQueryDatasets.pageInfo.pageEnd}
					{:else}
						{$BigQuery.data.team.bigQueryDatasets.pageInfo.pageStart}
					{/if}

					of {$BigQuery.data.team.bigQueryDatasets.pageInfo.totalCount}
				</span>

				<span style="padding-left: 1rem;">
					<Button
						size="small"
						variant="secondary"
						disabled={!$BigQuery.data.team.bigQueryDatasets.pageInfo.hasPreviousPage}
						on:click={async () => {
							return await BigQuery.loadPreviousPage();
						}}><ChevronLeftIcon /></Button
					>
					<Button
						size="small"
						variant="secondary"
						disabled={!$BigQuery.data.team.bigQueryDatasets.pageInfo.hasNextPage}
						on:click={async () => {
							return await BigQuery.loadNextPage();
						}}
					>
						<ChevronRightIcon /></Button
					>
				</span>
			</div>
		{/if}
	</Card>
{/if}

<style>
	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
