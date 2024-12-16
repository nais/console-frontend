<script lang="ts">
	import { page } from '$app/stores';
	import { OpenSearchOrderField, PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import { resourceLink } from '$lib/utils/links';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let teamName = $derived($page.params.team);
	let { OpenSearch } = $derived(data);

	let tableSort = $derived({
		orderBy: $OpenSearch.variables?.orderBy?.field,
		direction: $OpenSearch.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = OpenSearchOrderField[key as keyof typeof OpenSearchOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || OpenSearchOrderField.NAME
		});
	};
</script>

<GraphErrors errors={$OpenSearch.errors} />

{#if $OpenSearch.data}
	{@const cost = $OpenSearch.data.team.cost}
	{@const os = $OpenSearch.data.team.openSearchInstances}
	<div class="summary-grid">
		<Card columns={3}>
			<SummaryCard title="Cost" helpText="Total OpenSearch cost for the last 30 days" color="green">
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
				orderBy: tableSort.orderBy || OpenSearchOrderField.NAME,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			onsortchange={tableSortChange}
		>
			<Thead>
				<Tr>
					<Th sortable={true} sortKey={OpenSearchOrderField.NAME}>Name</Th>
					<Th sortable={true} sortKey={OpenSearchOrderField.ENVIRONMENT}>Environment</Th>
					<Th>Owner</Th>
				</Tr>
			</Thead>
			<Tbody>
				{#each os.nodes as o}
					{#if o !== PendingValue}
						<Tr>
							<!-- TODO: show warning if no workload uses this instance -->
							<Td>
								<a href={resourceLink(o.environment.name, teamName, 'opensearch', o.name)}
									>{o.name}</a
								>
							</Td>
							<Td>
								{o.environment.name}
							</Td>
							<Td>
								{#if o.workload}
									<WorkloadLink workload={o.workload} />
								{:else}
									<em title="The OpenSearch instance is owned by the team">Team</em>
								{/if}
							</Td>
						</Tr>
					{:else}
						<Tr>
							<Td>
								<Skeleton variant="text" />
							</Td>
							<Td>
								<Skeleton variant="text" />
							</Td>
							<Td>
								<Skeleton variant="text" />
							</Td>
						</Tr>
					{/if}
				{:else}
					<Tr>
						<Td colspan={999}>No OpenSearch instances found</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
		{#if os.pageInfo !== PendingValue}
			{#if os.pageInfo.hasPreviousPage || os.pageInfo.hasNextPage}
				<div class="pagination">
					<span>
						{#if os.pageInfo.pageStart !== os.pageInfo.pageEnd}
							{os.pageInfo.pageStart} - {os.pageInfo.pageEnd}
						{:else}
							{os.pageInfo.pageStart}
						{/if}

						of {os.pageInfo.totalCount}
					</span>

					<span style="padding-left: 1rem;">
						<Button
							size="small"
							variant="secondary"
							disabled={!os.pageInfo.hasPreviousPage}
							onclick={async () => {
								return await OpenSearch.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!os.pageInfo.hasNextPage}
							onclick={async () => {
								return await OpenSearch.loadNextPage();
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
	.summary-grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
		margin-bottom: 1rem;
	}

	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
