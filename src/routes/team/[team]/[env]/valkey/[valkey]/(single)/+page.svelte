<script lang="ts">
	import { page } from '$app/state';
	import { graphql, ValkeyAccessOrderField } from '$houdini';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import IssueListItem from '$lib/components/list/IssueListItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import ServiceMaintenanceListItem from '$lib/components/list/ServiceMaintenanceListItem.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import { docURL } from '$lib/doc';
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
	import { CogRotationIcon, NotePencilIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import Manifest from './Manifest.svelte';

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
	let { Valkey, viewerIsMember, teamSlug } = $derived(data);

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

	const isManagedByConsole = $derived(
		!$Valkey.data?.team.environment.valkey.name.startsWith(`valkey-${teamSlug}-`)
	);
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
			{#if viewerIsMember && !isManagedByConsole}
				<Alert variant="info" style="margin-bottom: 1rem;">
					This Valkey instance is managed outside Console.<br />
					To migrate this instance to Console, see the
					<ExternalLink href={docURL('/persistence/valkey/how-to/migrate-to-console/')}>
						Nais documentation
					</ExternalLink>.
				</Alert>
			{/if}
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
			<div class="spacing">
				<Heading level="3">Issues</Heading>
				<List>
					{#each $Valkey.data.team.environment.valkey.issues.edges as edge (edge.node.id)}
						<IssueListItem item={edge.node} />
					{:else}
						<span>No issues found</span>
					{/each}
				</List>
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
				<Heading level="3">State</Heading>
				<BodyShort>{instance.state}</BodyShort>
			</div>
			<div>
				<Heading level="3">Settings</Heading>
				<BodyShort>Tier: {instance.tier}</BodyShort>
				<BodyShort>Memory: {instance.memory}</BodyShort>
				{#if instance.maxMemoryPolicy}
					<BodyShort>Max memory policy: {instance.maxMemoryPolicy}</BodyShort>
				{/if}
				{#if instance.notifyKeyspaceEvents}
					<BodyShort>Notify keyspace events: {instance.notifyKeyspaceEvents}</BodyShort>
				{/if}
				{#if viewerIsMember && isManagedByConsole}
					<a
						class="mt-2"
						href="/team/{page.params.team}/{page.params.env}/valkey/{page.params.valkey}/edit"
					>
						Edit <NotePencilIcon />
					</a>
				{/if}
			</div>
			{#if instance.maintenance && instance.maintenance.window}
				<div>
					<Heading level="3">Maintenance window</Heading>
					<BodyShort>Day of week: {instance.maintenance.window.dayOfWeek}</BodyShort>
					<BodyShort>Time of day: {instance.maintenance.window.timeOfDay.slice(0, -3)}</BodyShort>
				</div>
			{/if}

			<Manifest valkey={instance} teamSlug={page.params.team!} />
			{#if viewerIsMember && isManagedByConsole}
				<Button
					as="a"
					variant="danger"
					size="small"
					href="/team/{page.params.team}/{page.params.env}/valkey/{page.params.valkey}/delete"
					icon={TrashIcon}
					class="self-start"
				>
					Delete Valkey
				</Button>
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
