<script lang="ts">
	import { RedisInstanceAccessOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import PersistenceIcon from '$lib/PersistenceIcon.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Button, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { RedisInstance } = $derived(data);

	let tableSort = $derived({
		orderBy: $RedisInstance.variables?.orderBy?.field,
		direction: $RedisInstance.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy =
				RedisInstanceAccessOrderField[key as keyof typeof RedisInstanceAccessOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || RedisInstanceAccessOrderField.WORKLOAD
		});
	};
</script>

{#if $RedisInstance.errors}
	<GraphErrors errors={$RedisInstance.errors} />
{/if}
{#if $RedisInstance.data}
	{@const redisInstance = $RedisInstance.data.team.environment.redisInstance}
	<div class="grid">
		<Card columns={7}>
			<h3 class="heading">
				{#if redisInstance.__typename}
					<PersistenceIcon type={redisInstance.__typename} size="32px" />
				{/if}
				{redisInstance.name}
			</h3>
			<h4 style="margin-bottom: 0;">Owner</h4>
			<div style="margin-left: 1em; margin-top: 0;">
				{#if redisInstance.workload}
					<WorkloadLink workload={redisInstance.workload} showIcon={true} />
				{:else}
					<div class="inline">
						<i>This Redis instance does not belong to any workload</i>
					</div>
				{/if}
			</div>
			<h4 class="access">Access</h4>
			<Table
				size="small"
				zebraStripes
				sort={{
					orderBy: tableSort.orderBy || RedisInstanceAccessOrderField.WORKLOAD,
					direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
				}}
				onsortchange={tableSortChange}
			>
				<Thead>
					<Tr>
						<Th sortable={true} sortKey={RedisInstanceAccessOrderField.WORKLOAD}>Workload</Th>
						<Th sortable={true} sortKey={RedisInstanceAccessOrderField.ACCESS}>Access level</Th>
						<Th>Type</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each redisInstance.access.edges as edge}
						{@const access = edge.node}
						<Tr>
							<Td>
								<WorkloadLink workload={access.workload} showIcon={true} />
							</Td>
							<Td>{access.access}</Td>

							<Td>{access.workload.__typename}</Td>
						</Tr>
					{:else}
						<Tr>
							<Td colspan={3}>No access</Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
			{#if redisInstance.access.pageInfo.hasPreviousPage || redisInstance.access.pageInfo.hasNextPage}
				<div class="pagination">
					<span>
						{#if redisInstance.access.pageInfo.pageStart !== redisInstance.access.pageInfo.pageEnd}
							{redisInstance.access.pageInfo.pageStart} - {redisInstance.access.pageInfo.pageEnd}
						{:else}
							{redisInstance.access.pageInfo.pageStart}
						{/if}
						of {redisInstance.access.pageInfo.totalCount}
					</span>

					<span style="padding-left: 1rem;">
						<Button
							size="small"
							variant="secondary"
							disabled={!redisInstance.access.pageInfo.hasPreviousPage}
							onclick={async () => {
								return await RedisInstance.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!redisInstance.access.pageInfo.hasNextPage}
							onclick={async () => {
								return await RedisInstance.loadNextPage();
							}}
						>
							<ChevronRightIcon /></Button
						>
					</span>
				</div>
			{/if}
		</Card>
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	.heading {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	h4.access {
		margin-top: 1em;
		margin-bottom: 0;
	}

	.inline {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
