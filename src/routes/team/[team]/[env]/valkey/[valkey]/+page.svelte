<script lang="ts">
	import { ValkeyInstanceAccessOrderField } from '$houdini';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyShort, Heading, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
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
	{@const mandatoryServiceMaintenanceUpdates =
		$ValkeyInstance.data.team.environment.valkeyInstance.maintenance.updates.filter(
			(x) => !!x?.deadline
		)}
	{@const nonMandatoryServiceMaintenanceUpdates =
		$ValkeyInstance.data.team.environment.valkeyInstance.maintenance.updates.filter(
			(x) => !x?.deadline
		)}
	<div class="wrapper">
		<div>
			<Heading level="3" spacing>Valkey Instance Access List</Heading>
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
		<div>
			<Heading level="3">Ventende vedlikehold</Heading>
			<Heading level="4">Påkrevd vedlikehold</Heading>
			{#if mandatoryServiceMaintenanceUpdates.length > 0}
				<ul>
					{#each mandatoryServiceMaintenanceUpdates as u (u?.title)}
						<li>
							<p>{u?.title}</p>
							<p>{u?.description}</p>
						</li>
					{/each}
				</ul>
			{/if}

			<Heading level="4">Anbefalt vedlikehold</Heading>
			{#if nonMandatoryServiceMaintenanceUpdates.length > 0}
				<ul>
					{#each nonMandatoryServiceMaintenanceUpdates as u (u?.title)}
						<li>
							<p>{u?.title}</p>
							<p>{u?.description}</p>
						</li>
					{/each}
				</ul>
			{/if}
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
