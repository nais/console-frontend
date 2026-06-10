<script lang="ts">
	import { page } from '$app/state';
	import { graphql, ValkeyAccessOrderField } from '$houdini';
	import { docURL } from '$lib/doc';
	import PersistenceActivityCard from '$lib/domain/activity/PersistenceActivityCard.svelte';
	import Labels from '$lib/domain/labels/Labels.svelte';
	import LabelsEditorModal from '$lib/domain/labels/LabelsEditorModal.svelte';
	import type { Label } from '$lib/domain/labels/labels';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import ServiceMaintenanceListItem from '$lib/domain/list-items/ServiceMaintenanceListItem.svelte';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ManifestCard from '$lib/ui/ManifestCard.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		Alert,
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

	let labelsModalOpen = $state(false);

	const updateValkeyLabels = graphql(`
		mutation updateValkeyLabels(
			$name: String!
			$team: Slug!
			$env: String!
			$labels: [ResourceLabelInput!]
			$memory: ValkeyMemory!
			$tier: ValkeyTier!
		) {
			updateValkey(
				input: {
					name: $name
					teamSlug: $team
					environmentName: $env
					labels: $labels
					memory: $memory
					tier: $tier
				}
			) {
				valkey {
					id
					labels {
						key
						value
					}
				}
			}
		}
	`);

	const saveLabels = async (labels: Label[]) => {
		const instance = $Valkey.data?.team.environment.valkey;
		if (!instance) return;
		await updateValkeyLabels.mutate({
			name: instance.name,
			team: teamSlug,
			env: instance.teamEnvironment.environment.name,
			labels,
			memory: instance.memory,
			tier: instance.tier
		});
		if ($updateValkeyLabels.errors) return;
		labelsModalOpen = false;
		Valkey.fetch();
	};

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
	<div class="layout-two-column">
		<div class="content">
			{#if !isManagedByConsole}
				<Alert variant="info">
					This Valkey instance is managed outside Console.<br />
					To migrate this instance to Console, see the
					<ExternalLink href={docURL('/persistence/valkey/how-to/migrate-to-console/')}>
						Nais documentation
					</ExternalLink>.
				</Alert>
			{/if}
			{#if viewerIsMember && isManagedByConsole}
				<div class="detail-actions">
					<Button
						as="a"
						variant="danger"
						size="small"
						href="/team/{page.params.team}/{page.params.env}/valkey/{page.params.valkey}/delete"
						icon={TrashIcon}
					>
						Delete
					</Button>
				</div>
			{/if}

			<section aria-labelledby="settings-heading">
				<div class="section-header">
					<Heading as="h2" id="settings-heading" size="medium">Settings</Heading>
					{#if viewerIsMember && isManagedByConsole}
						<Button
							as="a"
							variant="secondary"
							size="small"
							href="/team/{page.params.team}/{page.params.env}/valkey/{page.params.valkey}/edit"
							icon={NotePencilIcon}
						>
							Edit
						</Button>
					{/if}
				</div>
				<dl class="settings-list">
					<dt>State</dt>
					<dd>{instance.state}</dd>
					<dt>Tier</dt>
					<dd>{instance.tier}</dd>
					<dt>Memory</dt>
					<dd>{instance.memory}</dd>
					{#if instance.maxMemoryPolicy}
						<dt>Max memory policy</dt>
						<dd>{instance.maxMemoryPolicy}</dd>
					{/if}
					{#if instance.notifyKeyspaceEvents}
						<dt>Notify keyspace events</dt>
						<dd>{instance.notifyKeyspaceEvents}</dd>
					{/if}
					{#if instance.databases !== 16}
						<dt>Number of databases</dt>
						<dd>{instance.databases}</dd>
					{/if}
					{#if instance.maintenance && instance.maintenance.window}
						<dt>Maintenance day</dt>
						<dd>{instance.maintenance.window.dayOfWeek}</dd>
						<dt>Maintenance time</dt>
						<dd>{instance.maintenance.window.timeOfDay.slice(0, -3)}</dd>
					{/if}
				</dl>
			</section>

			<section aria-labelledby="access-heading">
				<Heading as="h2" id="access-heading" size="medium" spacing>Valkey Access List</Heading>
				<div class="table-scroll" role="region" aria-label="Valkey access list">
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
				</div>
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
			</section>

			<section aria-labelledby="issues-heading">
				<Heading as="h2" id="issues-heading" size="medium" spacing>Issues</Heading>
				<List>
					{#each $Valkey.data.team.environment.valkey.issues.edges as edge (edge.node.id)}
						<IssueListItem item={edge.node} />
					{:else}
						<span>No issues found</span>
					{/each}
				</List>
			</section>

			{#if maintenanceError}
				<Alert variant="error">
					{maintenanceError}
				</Alert>
			{/if}

			{#if mandatoryServiceMaintenanceUpdates.length > 0 || nonMandatoryServiceMaintenanceUpdates.length > 0}
				<section aria-labelledby="maintenance-heading">
					<div class="service-maintenance-list-heading">
						<Heading as="h2" id="maintenance-heading" size="medium">Pending maintenance</Heading>

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
				</section>
			{/if}
		</div>

		<div class="layout-sidebar">
			<ManifestCard
				title="Use this Valkey"
				manifest={`spec:\n  valkey:\n    - instance: ${instance.name.replace(`valkey-${teamSlug}-`, '')}`}
			/>

			<Labels
				labels={instance.labels ?? []}
				onEdit={viewerIsMember ? () => (labelsModalOpen = true) : undefined}
			/>
			<PersistenceActivityCard resourceType="valkey" resource={instance} />
		</div>
	</div>

	{#if labelsModalOpen}
		<LabelsEditorModal
			labels={instance.labels}
			title="Edit Valkey labels"
			errors={$updateValkeyLabels.errors}
			onsave={saveLabels}
			onclose={() => (labelsModalOpen = false)}
		/>
	{/if}
{/if}

<style>
	.content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
		min-width: 0;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-8);
		margin-bottom: var(--ax-space-16);
	}

	.service-maintenance-list-heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: var(--ax-space-16);
		gap: var(--ax-space-4);
		flex-wrap: wrap;
	}

	@media (max-width: 767px) {
		.service-maintenance-list-heading {
			flex-direction: column;
		}
	}
</style>
