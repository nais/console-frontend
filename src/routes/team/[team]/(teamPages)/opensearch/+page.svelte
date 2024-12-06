<script lang="ts">
	import { page } from '$app/stores';
	import { OpenSearchOrderField, PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
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

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ OpenSearch } = data);

	$: tableSort = {
		orderBy: $OpenSearch.variables?.orderBy?.field,
		direction: $OpenSearch.variables?.orderBy?.direction
	};

	const tableSortChange = (e: CustomEvent<{ key: string }>) => {
		const { key } = e.detail;
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
			<div class="summaryCard">
				<div class="summaryIcon" style="--bg-color: #91dc75">
					<CostIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>
						Cost
						<HelpText title="">Total OpenSearch cost for team for the last 30 days.</HelpText>
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
				orderBy: tableSort.orderBy || OpenSearchOrderField.NAME,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			on:sortChange={tableSortChange}
		>
			<Thead>
				<Th sortable={true} sortKey={OpenSearchOrderField.NAME}>Name</Th>
				<Th sortable={true} sortKey={OpenSearchOrderField.ENVIRONMENT}>Environment</Th>
				<Th>Owner</Th>
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
							on:click={async () => {
								return await OpenSearch.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!os.pageInfo.hasNextPage}
							on:click={async () => {
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

	.summaryIcon {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 50px;
		height: 50px;
		border: 1px solid var(--bg-color);
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
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
