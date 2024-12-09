<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';

	import { PendingValue, RedisInstanceOrderField } from '$houdini';
	import Cost from '$lib/components/Cost.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
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
			<div class="summaryCard">
				<div class="summaryIcon" style="--bg-color: #91dc75">
					<CostIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>
						Cost
						<HelpText title="">Total Redis cost for team for the last 30 days.</HelpText>
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

	.summaryCard {
		display: grid;
		grid-template-columns: 50px 1fr;
		align-items: center;
		gap: 20px;
	}

	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
