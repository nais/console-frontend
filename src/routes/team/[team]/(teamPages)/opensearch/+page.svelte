<script lang="ts">
	import { OpenSearchOrderField, PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import PersistenceLink from '$lib/components/PersistenceLink.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { WalletIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

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
					<WalletIcon height="32px" width="32px" {color} />
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
								<PersistenceLink instance={o} />
							</Td>
							<Td>
								{o.environment.name}
							</Td>
							<Td>
								{#if o.workload}
									<WorkloadLink workload={o.workload} showIcon={true} />
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
				<Pagination
					page={os.pageInfo}
					loaders={{
						loadPreviousPage: () => OpenSearch.loadPreviousPage(),
						loadNextPage: () => OpenSearch.loadNextPage()
					}}
				/>
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
</style>
