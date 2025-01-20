<script lang="ts">
	import { BucketOrderField, PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Button, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import {
		ChevronLeftIcon,
		ChevronRightIcon,
		ExclamationmarkTriangleFillIcon,
		WalletIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { Buckets, teamSlug } = $derived(data);

	let tableSort = $derived({
		orderBy: $Buckets.variables?.orderBy?.field,
		direction: $Buckets.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
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
			<SummaryCard
				title="Cost"
				helpText="Total SQL instance cost for the last 30 days"
				color="green"
			>
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
				orderBy: tableSort.orderBy || BucketOrderField.NAME,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			onsortchange={tableSortChange}
		>
			<Thead>
				<Tr>
					<Th sortable={true} sortKey={BucketOrderField.NAME}>Name</Th>
					<Th sortable={true} sortKey={BucketOrderField.ENVIRONMENT}>Environment</Th>
					<Th>Owner</Th>
				</Tr>
			</Thead>
			<Tbody>
				{#each buckets.nodes as b}
					{#if b !== PendingValue}
						<Tr>
							<Td>
								<a href="/team/{teamSlug}/{b.environment.name}/bucket/{b.name}">
									{b.name}
								</a>
							</Td>
							<Td>
								{b.environment.name}
							</Td>
							<Td>
								{#if b.workload}
									<WorkloadLink workload={b.workload} showIcon={true} />
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
							onclick={async () => {
								return await Buckets.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!buckets.pageInfo.hasNextPage}
							onclick={async () => {
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

	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
