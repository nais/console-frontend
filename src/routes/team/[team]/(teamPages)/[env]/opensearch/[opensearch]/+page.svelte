<script lang="ts">
	import { OpenSearchAccessOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import PersistenceHeader from '$lib/PersistenceHeader.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Button, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { OpenSearchInstance } = $derived(data);

	let tableSort = $derived({
		orderBy: $OpenSearchInstance.variables?.orderBy?.field,
		direction: $OpenSearchInstance.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy =
				OpenSearchAccessOrderField[key as keyof typeof OpenSearchAccessOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || OpenSearchAccessOrderField.WORKLOAD
		});
	};
</script>

{#if $OpenSearchInstance.errors}
	<GraphErrors errors={$OpenSearchInstance.errors} />
{:else if $OpenSearchInstance.data}
	{@const instance = $OpenSearchInstance.data.team.environment.openSearchInstance}
	<PersistenceHeader
		type={instance.__typename}
		name={instance.name}
		environment={instance.environment.name}
		text="All OpenSearch instances"
		path="/team/{$OpenSearchInstance.data.team.slug}/opensearch"
	/>
	<div class="grid">
		<Card columns={12}>
			<h3>OpenSearch instance details</h3>
			<h4 style="margin-bottom: 0;">Owner</h4>
			<div style="margin-left: 1em; margin-top: 0;">
				{#if instance.workload}
					<WorkloadLink workload={instance.workload} showIcon={true} />
				{:else}
					<div class="inline">
						<i>This OpenSearch instance does not belong to any workload</i>
					</div>
				{/if}
			</div>
			<h4 class="access">Access</h4>
			{#if instance.access.edges.length > 0}
				<Table
					size="small"
					zebraStripes
					sort={{
						orderBy: tableSort.orderBy || OpenSearchAccessOrderField.WORKLOAD,
						direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
					}}
					onsortchange={tableSortChange}
				>
					<Thead>
						<Tr>
							<Th sortable={true} sortKey={OpenSearchAccessOrderField.WORKLOAD}>Workload</Th>
							<Th sortable={true} sortKey={OpenSearchAccessOrderField.ACCESS}>Access level</Th>
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
								<Td><code>{access.access}</code></Td>
								<Td>{access.workload.__typename}</Td>
							</Tr>
						{/each}
					</Tbody>
				</Table>
				{#if instance.access.pageInfo.hasPreviousPage || instance.access.pageInfo.hasNextPage}
					<div class="pagination">
						<span>
							{#if instance.access.pageInfo.pageStart !== instance.access.pageInfo.pageEnd}
								{instance.access.pageInfo.pageStart} - {instance.access.pageInfo.pageEnd}
							{:else}
								{instance.access.pageInfo.pageStart}
							{/if}
							of {instance.access.pageInfo.totalCount}
						</span>

						<span style="padding-left: 1rem;">
							<Button
								size="small"
								variant="secondary"
								disabled={!instance.access.pageInfo.hasPreviousPage}
								onclick={async () => {
									return await OpenSearchInstance.loadPreviousPage();
								}}><ChevronLeftIcon /></Button
							>
							<Button
								size="small"
								variant="secondary"
								disabled={!instance.access.pageInfo.hasNextPage}
								onclick={async () => {
									return await OpenSearchInstance.loadNextPage();
								}}
							>
								<ChevronRightIcon /></Button
							>
						</span>
					</div>
				{/if}
			{:else}
				<p>No workloads with configured access</p>
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
	code {
		font-size: 0.8em;
	}

	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
