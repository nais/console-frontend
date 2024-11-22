<script lang="ts">
	import { page } from '$app/stores';
	import { BigQueryDatasetOrderField, PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';

	import { resourceLink } from '$lib/utils/links';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		Alert,
		Button,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ BigQuery } = data);

	$: tableSort = {
		orderBy: $BigQuery.variables?.orderBy?.field,
		direction: $BigQuery.variables?.orderBy?.direction
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
			field: tableSort.orderBy || BigQueryDatasetOrderField.NAME
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
{/if}
{#if $BigQuery.data}
	{@const datasets = $BigQuery.data.team.bigQueryDatasets}
	<Card columns={12}>
		<Table
			size="small"
			zebraStripes
			sort={{
				orderBy: tableSort.orderBy || BigQueryDatasetOrderField.NAME,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			on:sortChange={tableSortChange}
		>
			<Thead>
				<Th sortable={true} sortKey={BigQueryDatasetOrderField.NAME}>Name</Th>
				<Th sortable={true} sortKey={BigQueryDatasetOrderField.ENVIRONMENT}>Environment</Th>
				<Th>Owner</Th>
			</Thead>
			<Tbody>
				{#each datasets.nodes as ds}
					<Tr>
						{#if ds !== PendingValue}
							<Td>
								<a href={resourceLink(ds.environment.name, teamName, 'bigquery', ds.name)}>
									{ds.name}
								</a>
							</Td>
							<Td>
								{ds.environment.name}
							</Td>
							<Td>
								{#if ds.workload}
									<WorkloadLink workload={ds.workload} />
								{:else}
									<em>No owner</em>
								{/if}
							</Td>
						{:else}
							<Td>
								<Skeleton variant="text" />
							</Td>
							<Td>
								<Skeleton variant="text" />
							</Td>
							<Td>
								<Skeleton variant="text" />
							</Td>
						{/if}
					</Tr>
				{:else}
					<Tr>
						<Td colspan={999}>No BigQuery datasets found</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
		{#if datasets.pageInfo !== PendingValue}
			{#if datasets.pageInfo.hasPreviousPage || datasets.pageInfo.hasNextPage}
				<div class="pagination">
					<span>
						{#if datasets.pageInfo.pageStart !== datasets.pageInfo.pageEnd}
							{datasets.pageInfo.pageStart} - {datasets.pageInfo.pageEnd}
						{:else}
							{datasets.pageInfo.pageStart}
						{/if}

						of {datasets.pageInfo.totalCount}
					</span>

					<span style="padding-left: 1rem;">
						<Button
							size="small"
							variant="secondary"
							disabled={!datasets.pageInfo.hasPreviousPage}
							on:click={async () => {
								return await BigQuery.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!datasets.pageInfo.hasNextPage}
							on:click={async () => {
								return await BigQuery.loadNextPage();
							}}
						>
							<ChevronRightIcon /></Button
						>
					</span>
				</div>
			{/if}
		{/if}
	</Card>
{/if}

<style>
	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
