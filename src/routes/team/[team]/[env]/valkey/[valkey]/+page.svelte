<script lang="ts">
	import { graphql, ValkeyInstanceAccessOrderField } from '$houdini';
	import List from '$lib/components/list/List.svelte';
	import ServiceMaintenanceListItem from '$lib/components/list/ServiceMaintenanceListItem.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		Alert,
		BodyShort,
		Button,
		Heading,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	const runServiceMaintenance = graphql(`
		mutation runValkeyMaintenance(
			$serviceName: String!
			$teamSlug: Slug!
			$environmentName: String!
		) {
			startValkeyMaintenance(
				input: { serviceName: $serviceName, teamSlug: $teamSlug, environmentName: $environmentName }
			) {
				error
			}
		}
	`);

	let maintenanceError = $state<string | null | undefined>(undefined);
	const runServiceMaintenanceStart = async () => {
		if ($ValkeyInstance.data) {
			let resp = await runServiceMaintenance.mutate({
				serviceName: $ValkeyInstance.data.team.environment.valkeyInstance.name,
				teamSlug: $ValkeyInstance.data.team.slug,
				environmentName:
					$ValkeyInstance.data.team.environment.valkeyInstance.teamEnvironment.environment.name
			});
			if (resp.errors) {
				maintenanceError = resp.errors.map((e) => e.message).join(', ');
			} else {
				maintenanceError = resp.data?.startValkeyMaintenance?.error;
			}
		}
	};

	let { data }: PageProps = $props();
	let { ValkeyInstance, viewerIsMember } = $derived(data);

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

		changeParams(
			{
				direction: tableSort.direction,
				field: tableSort.orderBy || ValkeyInstanceAccessOrderField.WORKLOAD
			},
			{
				noScroll: true
			}
		);
	};
</script>

{#if $ValkeyInstance.errors}
	<GraphErrors errors={$ValkeyInstance.errors} />
{/if}
{#if $ValkeyInstance.data}
	{@const instance = $ValkeyInstance.data.team.environment.valkeyInstance}
	{@const mandatoryServiceMaintenanceUpdates =
		$ValkeyInstance.data.team.environment.valkeyInstance.maintenance.updates.nodes.filter(
			(x) => !!x?.deadline
		)}
	{@const nonMandatoryServiceMaintenanceUpdates =
		$ValkeyInstance.data.team.environment.valkeyInstance.maintenance.updates.nodes.filter(
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
						<WarningIcon title="This Valkey instance does not belong to any workload" />
					</div>
				{/if}
			</div>
			<div>
				<Heading level="3">Status</Heading>
				<BodyShort>{instance.status.state}</BodyShort>
			</div>
		</div>
		<div>
			{#if maintenanceError}
				<Alert variant="error" style="margin-bottom: 1rem;">
					{maintenanceError}
				</Alert>
			{/if}

			{#if mandatoryServiceMaintenanceUpdates.length > 0 || nonMandatoryServiceMaintenanceUpdates.length > 0}
				<div class="service-maintenance-list-heading">
					<Heading level="3">Pending maintenance</Heading>

					{#if maintenanceError === ''}
						<Button variant="secondary" size="small" disabled>Maintenance running</Button>
					{:else if viewerIsMember}
						<Button variant="primary" size="small" onclick={runServiceMaintenanceStart}>
							Run all maintenance
						</Button>
					{/if}
				</div>
				<div>
					<List>
						{#each mandatoryServiceMaintenanceUpdates.concat(nonMandatoryServiceMaintenanceUpdates) as u, index (index)}
							<ServiceMaintenanceListItem
								title={u?.title ?? 'Missing title'}
								description={u?.description ?? 'Missing description'}
								start_at={u?.startAt}
								deadline={!!u?.deadline}
							/>
						{/each}
					</List>
				</div>
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

	.service-maintenance-list-heading {
		display: flex;
		justify-content: space-between;
		margin-bottom: 8px;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
</style>
