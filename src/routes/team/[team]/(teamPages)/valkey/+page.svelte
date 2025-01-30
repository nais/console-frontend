<script lang="ts">
	import Card from '$lib/Card.svelte';

	import { PendingValue, ValkeyInstanceOrderField } from '$houdini';
	import Cost from '$lib/components/Cost.svelte';
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

	let { Valkey, teamSlug } = $derived(data);

	let tableSort = $derived({
		orderBy: $Valkey.variables?.orderBy?.field,
		direction: $Valkey.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = ValkeyInstanceOrderField[key as keyof typeof ValkeyInstanceOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || ValkeyInstanceOrderField.NAME
		});
	};
</script>

<GraphErrors errors={$Valkey.errors} />

{#if $Valkey.data}
	{@const cost = $Valkey.data.team.cost}
	{@const valkey = $Valkey.data.team.valkeyInstances}
	<div class="summary-grid">
		<Card columns={3}>
			<SummaryCard title="Cost" helpText="Total Valkey cost for the last 30 days" color="green">
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
				orderBy: tableSort.orderBy || ValkeyInstanceOrderField.NAME,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			onsortchange={tableSortChange}
		>
			<Thead>
				<Tr>
					<Th sortable={true} sortKey={ValkeyInstanceOrderField.NAME}>Name</Th>
					<Th sortable={true} sortKey={ValkeyInstanceOrderField.ENVIRONMENT}>Environment</Th>
					<Th>Owner</Th>
				</Tr>
			</Thead>
			<Tbody>
				{#each valkey.nodes as r}
					{#if r !== PendingValue}
						<Tr>
							<Td>
								<a href="/team/{teamSlug}/{r.environment.name}/valkey/{r.name}">
									{r.name}
								</a>
							</Td>
							<Td>
								{r.environment.name}
							</Td>
							<Td>
								{#if r.workload}
									<WorkloadLink workload={r.workload} showIcon={true} />
								{:else}
									<em title="The Valkey instance is owned by the team">Team</em>
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
						<Td colspan={999}>No Valkey found</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
		{#if valkey.pageInfo !== PendingValue}
			{#if valkey.pageInfo.hasPreviousPage || valkey.pageInfo.hasNextPage}
				<Pagination
					page={valkey.pageInfo}
					loaders={{
						loadPreviousPage: () => Valkey.loadPreviousPage(),
						loadNextPage: () => Valkey.loadNextPage()
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
