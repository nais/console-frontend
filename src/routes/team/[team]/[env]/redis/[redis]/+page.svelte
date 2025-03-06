<script lang="ts">
	import { RedisInstanceAccessOrderField } from '$houdini';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyShort, Heading, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
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

<GraphErrors errors={$RedisInstance.errors} />
{#if $RedisInstance.data}
	{@const instance = $RedisInstance.data.team.environment.redisInstance}

	<div class="wrapper">
		<div>
			<Heading level="3" spacing>Valkey instance access list</Heading>
			<Table
				size="small"
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
					{#each instance.access.edges as edge (edge)}
						{@const access = edge.node}
						<Tr>
							<Td>
								<WorkloadLink workload={access.workload} />
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
			<Pagination
				page={instance.access.pageInfo}
				loaders={{
					loadPreviousPage: () => {
						RedisInstance.loadPreviousPage();
					},
					loadNextPage: () => {
						RedisInstance.loadNextPage();
					}
				}}
			/>
		</div>
		<div class="sidebar">
			<div>
				<Heading level="3">Owner</Heading>
				{#if instance.workload}
					<WorkloadLink workload={instance.workload} />
				{:else}
					<div class="inline">
						<i>No owner</i>
						<WarningIcon title="This Big Query instance does not belong to any workload" />
					</div>
				{/if}
			</div>
			<div>
				<Heading level="3">Status</Heading>
				<BodyShort>{instance.status.state}</BodyShort>
			</div>
		</div>
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
</style>
