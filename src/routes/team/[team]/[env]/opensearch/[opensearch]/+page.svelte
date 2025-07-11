<script lang="ts">
	import { graphql, OpenSearchAccessOrderField } from '$houdini';
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
	import type { PageProps } from './$houdini';

	const runServiceMaintenance = graphql(`
		mutation runOpenSearchMaintenance(
			$serviceName: String!
			$teamSlug: Slug!
			$environmentName: String!
		) {
			startOpenSearchMaintenance(
				input: { serviceName: $serviceName, teamSlug: $teamSlug, environmentName: $environmentName }
			) {
				error
			}
		}
	`);

	let maintenanceError = $state<string | null | undefined>(undefined);
	const runServiceMaintenanceStart = async () => {
		if ($OpenSearchInstance.data) {
			let resp = await runServiceMaintenance.mutate({
				serviceName: $OpenSearchInstance.data.team.environment.openSearchInstance.name,
				teamSlug: $OpenSearchInstance.data.team.slug,
				environmentName:
					$OpenSearchInstance.data.team.environment.openSearchInstance.teamEnvironment.environment
						.name
			});
			if (resp.errors) {
				maintenanceError = resp.errors.map((e) => e.message).join(', ');
			} else {
				maintenanceError = resp.data?.startOpenSearchMaintenance?.error;
			}
		}
	};

	let { data }: PageProps = $props();
	let { OpenSearchInstance, viewerIsMember } = $derived(data);

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

		changeParams(
			{
				direction: tableSort.direction,
				field: tableSort.orderBy || OpenSearchAccessOrderField.WORKLOAD
			},
			{
				noScroll: true
			}
		);
	};
</script>

{#if $OpenSearchInstance.errors}
	<GraphErrors errors={$OpenSearchInstance.errors} />
{:else if $OpenSearchInstance.data}
	{@const instance = $OpenSearchInstance.data.team.environment.openSearchInstance}
	{@const mandatoryServiceMaintenanceUpdates = instance.maintenance.updates.nodes.filter(
		(x) => !!x?.deadline
	)}
	{@const nonMandatoryServiceMaintenanceUpdates = instance.maintenance.updates.nodes.filter(
		(x) => !x?.deadline
	)}

	<div class="wrapper">
		<div>
			<div class="spacing">
				<Heading level="2" spacing>OpenSearch Instance Access List</Heading>

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
		<div class="sidebar">
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
		margin-bottom: var(--ax-space-24);
	}

	.service-maintenance-list-heading {
		display: flex;
		justify-content: space-between;
		margin-bottom: var(--ax-space-12);
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
</style>
