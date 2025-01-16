<script lang="ts">
	import { BigQueryDatasetOrderField, PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';

	import Cost from '$lib/components/Cost.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import { resourceLink } from '$lib/utils/links';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Button, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { BigQuery, teamSlug } = $derived(data);

	let tableSort = $derived({
		orderBy: $BigQuery.variables?.orderBy?.field,
		direction: $BigQuery.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
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
</script>

<GraphErrors errors={$BigQuery.errors} />

{#if $BigQuery.data}
	{@const cost = $BigQuery.data.team.cost}
	{@const datasets = $BigQuery.data.team.bigQueryDatasets}
	<div class="summary-grid">
		<Card columns={3}>
			<SummaryCard
				title="Cost"
				helpText="Total Big Query cost for team for the last 30 days."
				color="green"
			>
				{#snippet icon({ color })}
					<CostIcon size="32" {color} />
				{/snippet}
				{#if cost !== PendingValue}
					<Cost cost={cost.daily.sum} />
				{:else}
					<Skeleton variant="text" />
				{/if}
			</SummaryCard>
		</Card>
	</div>
	<Card columns={12}>
		<Table
			size="small"
			zebraStripes
			sort={{
				orderBy: tableSort.orderBy || BigQueryDatasetOrderField.NAME,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			onsortchange={tableSortChange}
		>
			<Thead>
				<Tr>
					<Th sortable={true} sortKey={BigQueryDatasetOrderField.NAME}>Name</Th>
					<Th sortable={true} sortKey={BigQueryDatasetOrderField.ENVIRONMENT}>Environment</Th>
					<Th>Owner</Th>
				</Tr>
			</Thead>
			<Tbody>
				{#each datasets.nodes as ds}
					<Tr>
						{#if ds !== PendingValue}
							<Td>
								<a href={resourceLink(ds.environment.name, teamSlug, 'bigquery', ds.name)}>
									{ds.name}
								</a>
							</Td>
							<Td>
								{ds.environment.name}
							</Td>
							<Td>
								{#if ds.workload}
									<WorkloadLink workload={ds.workload} showIcon={true} />
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
							onclick={async () => {
								return await BigQuery.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!datasets.pageInfo.hasNextPage}
							onclick={async () => {
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
	.summary-grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
		margin-bottom: 1rem;
	}
</style>
