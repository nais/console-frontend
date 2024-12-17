<script lang="ts">
	import { page } from '$app/state';
	import Card from '$lib/Card.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';

	import { PendingValue, RedisInstanceOrderField } from '$houdini';
	import Cost from '$lib/components/Cost.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let teamName = $derived(page.params.team);
	let { Redis } = $derived(data);

	let tableSort = $derived({
		orderBy: $Redis.variables?.orderBy?.field,
		direction: $Redis.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = RedisInstanceOrderField[key as keyof typeof RedisInstanceOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || RedisInstanceOrderField.NAME
		});
	};
</script>

<GraphErrors errors={$Redis.errors} />

{#if $Redis.data}
	{@const cost = $Redis.data.team.cost}
	{@const redis = $Redis.data.team.redisInstances}
	<div class="summary-grid">
		<Card columns={3}>
			<SummaryCard title="Cost" helpText="Total Redis cost for the last 30 days" color="green">
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
				orderBy: tableSort.orderBy || RedisInstanceOrderField.NAME,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			onsortchange={tableSortChange}
		>
			<Thead>
				<Tr>
					<Th sortable={true} sortKey={RedisInstanceOrderField.NAME}>Name</Th>
					<Th sortable={true} sortKey={RedisInstanceOrderField.ENVIRONMENT}>Environment</Th>
					<Th>Owner</Th>
				</Tr>
			</Thead>
			<Tbody>
				{#each redis.nodes as r}
					{#if r !== PendingValue}
						<Tr>
							<!-- TODO: show warning if no workload uses this instance -->
							<Td>
								<a href="/team/{teamName}/{r.environment.name}/redis/{r.name}">
									{r.name}
								</a>
							</Td>
							<Td>
								{r.environment.name}
							</Td>
							<Td>
								{#if r.workload}
									<WorkloadLink workload={r.workload} />
								{:else}
									<em title="The Redis instance is owned by the team">Team</em>
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
						<Td colspan={999}>No Redis found</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
		{#if redis.pageInfo !== PendingValue}
			{#if redis.pageInfo.hasPreviousPage || redis.pageInfo.hasNextPage}
				<div class="pagination">
					<span>
						{#if redis.pageInfo.pageStart !== redis.pageInfo.pageEnd}
							{redis.pageInfo.pageStart} - {redis.pageInfo.pageEnd}
						{:else}
							{redis.pageInfo.pageStart}
						{/if}

						of {redis.pageInfo.totalCount}
					</span>

					<span style="padding-left: 1rem;">
						<Button
							size="small"
							variant="secondary"
							disabled={!redis.pageInfo.hasPreviousPage}
							onclick={async () => {
								return await Redis.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!redis.pageInfo.hasNextPage}
							onclick={async () => {
								return await Redis.loadNextPage();
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
