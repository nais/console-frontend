<script lang="ts">
	import { graphql, ValkeyAccessOrderField } from '$houdini';
	import List from '$lib/components/list/List.svelte';
	import ServiceMaintenanceListItem from '$lib/components/list/ServiceMaintenanceListItem.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
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
	import { CogRotationIcon } from '@nais/ds-svelte-community/icons';
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
		if ($Valkey.data) {
			let resp = await runServiceMaintenance.mutate({
				serviceName: $Valkey.data.team.environment.valkey.name,
				teamSlug: $Valkey.data.team.slug,
				environmentName: $Valkey.data.team.environment.valkey.teamEnvironment.environment.name
			});
			if (resp.errors) {
				maintenanceError = resp.errors.map((e) => e.message).join(', ');
			} else {
				maintenanceError = resp.data?.startValkeyMaintenance?.error;
			}
		}
	};

	let { data }: PageProps = $props();
	let { Valkey, viewerIsMember } = $derived(data);

	let tableSort = $derived({
		orderBy: $Valkey.variables?.orderBy?.field,
		direction: $Valkey.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = ValkeyAccessOrderField[key as keyof typeof ValkeyAccessOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams(
			{
				direction: tableSort.direction,
				field: tableSort.orderBy || ValkeyAccessOrderField.WORKLOAD
			},
			{
				noScroll: true
			}
		);
	};
</script>

{#if $Valkey.errors}
	<GraphErrors errors={$Valkey.errors} />
{/if}
{#if $Valkey.data}
	{@const instance = $Valkey.data.team.environment.valkey}
	{@const mandatoryServiceMaintenanceUpdates = instance.maintenance.updates.nodes.filter(
		(x) => !!x?.deadline
	)}
	{@const nonMandatoryServiceMaintenanceUpdates = instance.maintenance.updates.nodes.filter(
		(x) => !x?.deadline
	)}
	<div class="wrapper">
		<div>
			<div class="spacing">
				<Heading level="3" spacing>Valkey Access List</Heading>
				<Table
					size="small"
					sort={{
						orderBy: tableSort.orderBy || ValkeyAccessOrderField.WORKLOAD,
						direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
					}}
					onsortchange={tableSortChange}
				>
					<Thead>
						<Tr>
							<Th sortable={true} sortKey={ValkeyAccessOrderField.WORKLOAD}>Workload</Th>
							<Th sortable={true} sortKey={ValkeyAccessOrderField.ACCESS}>Access level</Th>
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
							Valkey.loadPreviousPage();
						},
						loadNextPage: () => {
							Valkey.loadNextPage();
						}
					}}
				/>
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
							<Button icon={CogRotationIcon} variant="secondary" size="small" disabled
								>Maintenance running</Button
							>
						{:else if viewerIsMember}
							<Button
								icon={CogRotationIcon}
								variant="secondary"
								size="small"
								onclick={runServiceMaintenanceStart}
							>
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
		<div class="sidebar">
			<div>
				<Heading level="3">Owner</Heading>
				{#if instance.workload}
					<WorkloadLink workload={instance.workload} />
				{:else}
					<div class="inline">
						<i>No owner</i>
					</div>
				{/if}
			</div>
			<div>
				<Heading level="3">Status</Heading>
				<BodyShort>{instance.status.state}</BodyShort>
			</div>
			{#if instance.maintenance && instance.maintenance.window}
				<div>
					<Heading level="3">Maintenance window</Heading>
					<BodyShort>Day of week: {instance.maintenance.window.dayOfWeek}</BodyShort>
					<BodyShort>Time of day: {instance.maintenance.window.timeOfDay.slice(0, -3)}</BodyShort>
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

	.spacing {
		margin-bottom: var(--spacing-layout);
	}

	.service-maintenance-list-heading {
		display: flex;
		justify-content: space-between;
		margin-bottom: var(--ax-space-16);
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
</style>
