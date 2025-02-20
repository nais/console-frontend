<script lang="ts">
	import { ValkeyInstanceAccessOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { ValkeyInstance } = $derived(data);

	let tableSort = $derived({
		orderBy: $ValkeyInstance.variables?.orderBy?.field,
		direction: $ValkeyInstance.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy =
				ValkeyInstanceAccessOrderField[key as keyof typeof ValkeyInstanceAccessOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || ValkeyInstanceAccessOrderField.WORKLOAD
		});
	};
</script>

{#if $ValkeyInstance.errors}
	<GraphErrors errors={$ValkeyInstance.errors} />
{/if}
{#if $ValkeyInstance.data}
	{@const instance = $ValkeyInstance.data.team.environment.valkeyInstance}

	<div class="grid">
		<Card columns={12}>
			<h3>Valkey details</h3>
			<h4 style="margin-bottom: 0;">Owner</h4>
			<div style="margin-left: 1em; margin-top: 0;">
				{#if instance.workload}
					<WorkloadLink workload={instance.workload} />
				{:else}
					<div class="inline">
						<i>This Valkey instance does not belong to any workload</i>
					</div>
				{/if}
			</div>
			<h4 class="access">Access</h4>
			<Table
				size="small"
				sort={{
					orderBy: tableSort.orderBy || ValkeyInstanceAccessOrderField.WORKLOAD,
					direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
				}}
				onsortchange={tableSortChange}
			>
				<Thead>
					<Tr>
						<Th sortable={true} sortKey={ValkeyInstanceAccessOrderField.WORKLOAD}>Workload</Th>
						<Th sortable={true} sortKey={ValkeyInstanceAccessOrderField.ACCESS}>Access level</Th>
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
						ValkeyInstance.loadPreviousPage();
					},
					loadNextPage: () => {
						ValkeyInstance.loadNextPage();
					}
				}}
			/>
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
