<script lang="ts">
	import { page } from '$app/stores';
	import { BigQueryDatasetOrderField, PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';

	import Cost from '$lib/components/Cost.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import { resourceLink } from '$lib/utils/links';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		Button,
		HelpText,
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

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let teamName = $derived($page.params.team);
	let { BigQuery } = $derived(data);

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
			<div class="summaryCard">
				<div class="summaryIcon" style="--bg-color: #91dc75">
					<CostIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>
						Cost
						<HelpText title="">Total Big Query cost for team for the last 30 days.</HelpText>
					</h4>
					<p class="metric">
						{#if cost !== PendingValue}
							<Cost cost={cost.daily.sum} />
						{:else}
							<Skeleton variant="text" />
						{/if}
					</p>
				</div>
			</div>
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
			onSortChange={tableSortChange}
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
							onClick={async () => {
								return await BigQuery.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!datasets.pageInfo.hasNextPage}
							onClick={async () => {
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
	.summaryCard {
		display: grid;
		grid-template-columns: 50px 1fr;
		align-items: center;
		gap: 20px;
	}
	.summaryIcon {
		display: flex;
		background-color: color-mix(in srgb, var(--bg-color) 10%, white);
		justify-content: center;
		align-items: center;
		width: 50px;
		height: 50px;
		border: 2px solid var(--bg-color);
		border-radius: 5px;
	}
	.summary {
		width: 100%;
	}
	.summary > h4 {
		display: flex;
		justify-content: space-between;
		margin: 0;
		font-size: 1rem;
		color: var(--color-text-secondary);
	}
	.metric {
		font-size: 1.5rem;
		margin: 0;
	}
</style>
