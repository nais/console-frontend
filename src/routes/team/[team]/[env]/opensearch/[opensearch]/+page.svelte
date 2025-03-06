<script lang="ts">
	import { OpenSearchAccessOrderField } from '$houdini';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyShort, Heading, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
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

	<div class="wrapper">
		<div>
			<Heading level="2" spacing>OpenSearch instance access list</Heading>

			{#if instance.access.edges.length > 0}
				<Table
					size="small"
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
						{#each instance.access.edges as edge (edge)}
							{@const access = edge.node}
							<Tr>
								<Td>
									<WorkloadLink workload={access.workload} />
								</Td>
								<Td><code>{access.access}</code></Td>
								<Td>{access.workload.__typename}</Td>
							</Tr>
						{/each}
					</Tbody>
				</Table>
				{#if instance.access.pageInfo.hasPreviousPage || instance.access.pageInfo.hasNextPage}
					<Pagination
						page={instance.access.pageInfo}
						loaders={{
							loadPreviousPage: () => {
								OpenSearchInstance.loadPreviousPage();
							},
							loadNextPage: () => {
								OpenSearchInstance.loadNextPage();
							}
						}}
					/>
				{/if}
			{:else}
				<p>No workloads with configured access</p>
			{/if}
		</div>
		<div class="sidebar">
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
