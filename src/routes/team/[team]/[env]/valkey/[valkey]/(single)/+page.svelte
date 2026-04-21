<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { docURL } from '$lib/doc';
	import SidebarActivity from '$lib/domain/activity/sidebar/SidebarActivity.svelte';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import ServiceMaintenanceListItem from '$lib/domain/list-items/ServiceMaintenanceListItem.svelte';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { getContextClient } from '$lib/urql/context';
	import { ValkeyAccessOrderField } from '$lib/urql/gql/graphql';
	import { cursorPaginationLoaders } from '$lib/urql/pagination';
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
	import { RunValkeyMaintenanceMutation } from './valkey';

	let { data }: PageProps = $props();
	let { Valkey, viewerIsMember, teamSlug } = $derived(data);

	const client = getContextClient();

	let maintenanceError = $state<string | null | undefined>(undefined);
	const runServiceMaintenanceStart = async () => {
		if (!Valkey.data) return;
		const instance = Valkey.data.team.environment.valkey;
		const resp = await client
			.mutation(RunValkeyMaintenanceMutation, {
				serviceName: instance.name,
				teamSlug: Valkey.data.team.slug,
				environmentName: instance.teamEnvironment.environment.name
			})
			.toPromise();
		if (resp.error) {
			maintenanceError = resp.error.graphQLErrors?.length
				? resp.error.graphQLErrors.map((e) => e.message).join(', ')
				: resp.error.message;
		} else {
			maintenanceError = resp.data?.startValkeyMaintenance?.error;
			void invalidateAll();
		}
	};

	let currentField = $derived(
		(page.url.searchParams.get('field') as ValkeyAccessOrderField | null) ??
			ValkeyAccessOrderField.WORKLOAD
	);
	let currentDirection = $derived(
		(page.url.searchParams.get('direction') as 'ASC' | 'DESC' | null) ?? 'ASC'
	);

	const tableSortChange = (key: string) => {
		let direction: 'ASC' | 'DESC';
		let field: ValkeyAccessOrderField;
		if (key === currentField) {
			direction = currentDirection === 'ASC' ? 'DESC' : 'ASC';
			field = currentField;
		} else {
			field = ValkeyAccessOrderField[key as keyof typeof ValkeyAccessOrderField];
			direction = 'ASC';
		}

		changeParams(
			{
				direction,
				field
			},
			{
				noScroll: true
			}
		);
	};

	const isManagedByConsole = $derived(
		!Valkey.data?.team.environment.valkey.name.startsWith(`valkey-${teamSlug}-`)
	);
</script>

{#if Valkey.errors}
	<GraphErrors errors={Valkey.errors} />
{/if}
{#if Valkey.data}
	{@const instance = Valkey.data.team.environment.valkey}
	{@const mandatoryServiceMaintenanceUpdates = instance.maintenance.updates.nodes.filter(
		(x) => !!x?.deadline
	)}
	{@const nonMandatoryServiceMaintenanceUpdates = instance.maintenance.updates.nodes.filter(
		(x) => !x?.deadline
	)}
	<div class="wrapper">
		<div>
			{#if !isManagedByConsole}
				<Alert variant="info" style="margin-bottom: 1rem;">
					This Valkey instance is managed outside Console.<br />
					To migrate this instance to Console, see the
					<ExternalLink href={docURL('/persistence/valkey/how-to/migrate-to-console/')}>
						Nais documentation
					</ExternalLink>.
				</Alert>
			{/if}
			<div class="spacing">
				<Heading as="h3" spacing>Valkey Access List</Heading>
				<Table
					size="small"
					sort={{
						orderBy: currentField,
						direction: currentDirection === 'ASC' ? 'ascending' : 'descending'
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
					loaders={cursorPaginationLoaders(page.url, instance.access.pageInfo)}
				/>
			</div>
			<div class="spacing">
				<Heading as="h3">Issues</Heading>
				<List>
					{#each instance.issues.edges as edge (edge.node.id)}
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
						<Heading as="h3">Pending maintenance</Heading>

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
				<Heading as="h3">State</Heading>
				<BodyShort>{instance.state}</BodyShort>
			</div>
			<div>
				<Heading as="h3">Settings</Heading>
				<BodyShort>Tier: {instance.tier}</BodyShort>
				<BodyShort>Memory: {instance.memory}</BodyShort>
				{#if instance.maxMemoryPolicy}
					<BodyShort>Max memory policy: {instance.maxMemoryPolicy}</BodyShort>
				{/if}
				{#if instance.notifyKeyspaceEvents}
					<BodyShort>Notify keyspace events: {instance.notifyKeyspaceEvents}</BodyShort>
				{/if}
				{#if instance.databases !== 16}
					<BodyShort>Number of databases: {instance.databases}</BodyShort>
				{/if}
			</div>
			{#if viewerIsMember && isManagedByConsole}
				<Button
					as="a"
					variant="secondary"
					size="small"
					href="/team/{page.params.team}/{page.params.env}/valkey/{page.params.valkey}/edit"
					class="self-start"
					icon={NotePencilIcon}
				>
					Edit
				</Button>
			{/if}
			{#if instance.maintenance && instance.maintenance.window}
				<div>
					<Heading as="h3">Maintenance window</Heading>
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

			<SidebarActivity activityLog={instance} />
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
