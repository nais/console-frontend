<script lang="ts">
	import { page } from '$app/stores';
	import { BucketOrderField, PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
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
	import {
		ChevronLeftIcon,
		ChevronRightIcon,
		ExclamationmarkTriangleFillIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ Buckets } = data);

	$: tableSort = {
		orderBy: $Buckets.variables?.orderBy?.field,
		direction: $Buckets.variables?.orderBy?.direction
	};

	const tableSortChange = (e: CustomEvent<{ key: string }>) => {
		const { key } = e.detail;
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = BucketOrderField[key as keyof typeof BucketOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || BucketOrderField.NAME
		});
	};
</script>

<GraphErrors errors={$Buckets.errors} />

{#if $Buckets.data}
	{@const cost = $Buckets.data.team.cost}
	{@const buckets = $Buckets.data.team.buckets}
	<div class="summary-grid">
		<Card columns={3}>
			<div class="summaryCard">
				<div class="summaryIcon" style="--bg-color: #91dc75">
					<CostIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>
						Cost
						<HelpText title="">Total Bucket cost for team for the last 30 days.</HelpText>
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
				orderBy: tableSort.orderBy || BucketOrderField.NAME,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			on:sortChange={tableSortChange}
		>
			<Thead>
				<Th sortable={true} sortKey={BucketOrderField.NAME}>Name</Th>
				<Th sortable={true} sortKey={BucketOrderField.ENVIRONMENT}>Environment</Th>
				<Th>Owner</Th>
			</Thead>
			<Tbody>
				{#each buckets.nodes as b}
					{#if b !== PendingValue}
						<Tr>
							<Td>
								<a href="/team/{teamName}/{b.environment.name}/bucket/{b.name}">
									{b.name}
								</a>
							</Td>
							<Td>
								{b.environment.name}
							</Td>
							<Td>
								{#if b.workload}
									<WorkloadLink workload={b.workload} />
								{:else}
									<div class="inline">
										<i>No owner</i>
										<ExclamationmarkTriangleFillIcon
											style="color: var(--a-icon-warning)"
											title="The bucket does not belong to any workload"
										/>
									</div>
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
						<Td colspan={999}>No buckets found</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
		{#if buckets.pageInfo !== PendingValue}
			{#if buckets.pageInfo.hasPreviousPage || buckets.pageInfo.hasNextPage}
				<div class="pagination">
					<span>
						{#if buckets.pageInfo.pageStart !== buckets.pageInfo.pageEnd}
							{buckets.pageInfo.pageStart} - {buckets.pageInfo.pageEnd}
						{:else}
							{buckets.pageInfo.pageStart}
						{/if}

						of {buckets.pageInfo.totalCount}
					</span>

					<span style="padding-left: 1rem;">
						<Button
							size="small"
							variant="secondary"
							disabled={!buckets.pageInfo.hasPreviousPage}
							on:click={async () => {
								return await Buckets.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!buckets.pageInfo.hasNextPage}
							on:click={async () => {
								return await Buckets.loadNextPage();
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
	.inline {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
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
