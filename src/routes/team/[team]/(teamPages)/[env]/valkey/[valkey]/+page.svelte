<script lang="ts">
	import { ValkeyInstanceAccessOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import Valkey from '$lib/icons/Valkey.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Button, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
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
	{@const valkeyInstance = $ValkeyInstance.data.team.environment.valkeyInstance}
	<div class="grid">
		<Card columns={7}>
			<h3 class="heading">
				<Valkey />
				{valkeyInstance.name}
			</h3>
			<h4 style="margin-bottom: 0;">Owner</h4>
			<div style="margin-left: 1em; margin-top: 0;">
				{#if valkeyInstance.workload}
					<WorkloadLink workload={valkeyInstance.workload} showIcon={true} />
				{:else}
					<div class="inline">
						<i>This Valkey instance does not belong to any workload</i>
					</div>
				{/if}
			</div>
			<h4 class="access">Access</h4>
			<Table
				size="small"
				zebraStripes
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
					{#each valkeyInstance.access.edges as edge}
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
			{#if valkeyInstance.access.pageInfo.hasPreviousPage || valkeyInstance.access.pageInfo.hasNextPage}
				<div class="pagination">
					<span>
						{#if valkeyInstance.access.pageInfo.pageStart !== valkeyInstance.access.pageInfo.pageEnd}
							{valkeyInstance.access.pageInfo.pageStart} - {valkeyInstance.access.pageInfo.pageEnd}
						{:else}
							{valkeyInstance.access.pageInfo.pageStart}
						{/if}
						of {valkeyInstance.access.pageInfo.totalCount}
					</span>

					<span style="padding-left: 1rem;">
						<Button
							size="small"
							variant="secondary"
							disabled={!valkeyInstance.access.pageInfo.hasPreviousPage}
							onclick={async () => {
								return await ValkeyInstance.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!valkeyInstance.access.pageInfo.hasNextPage}
							onclick={async () => {
								return await ValkeyInstance.loadNextPage();
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
		gap: 1rem;
		align-items: center;
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
