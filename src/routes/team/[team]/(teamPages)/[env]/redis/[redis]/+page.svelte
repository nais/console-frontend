<script lang="ts">
	import { RedisInstanceAccessOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import PersistenceHeader from '$lib/PersistenceHeader.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
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
	{@const instance = $RedisInstance.data.team.environment.redisInstance}
	<PersistenceHeader
		type={instance.__typename}
		name={instance.name}
		environment={instance.environment.name}
		text="All Redis instances"
		path="/team/{$RedisInstance.data?.team.slug}/redis"
	/>
	<div class="grid">
		<Card columns={12}>
			<h3>Redis details</h3>
			<h4 style="margin-bottom: 0;">Owner</h4>
			<div style="margin-left: 1em; margin-top: 0;">
				{#if instance.workload}
					<WorkloadLink workload={instance.workload} showIcon={true} />
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
					{#each instance.access.edges as edge}
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
			{#if instance.access.pageInfo.hasPreviousPage || instance.access.pageInfo.hasNextPage}
				<Pagination
					page={instance.access.pageInfo}
					loaders={{
						loadPreviousPage: () => RedisInstance.loadPreviousPage(),
						loadNextPage: () => RedisInstance.loadNextPage()
					}}
				/>
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

	h4.access {
		margin-top: 1em;
		margin-bottom: 0;
	}

	.inline {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
