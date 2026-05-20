<script lang="ts">
	import { page } from '$app/state';
	import { graphql, OpenSearchAccessOrderField } from '$houdini';
	import { docURL } from '$lib/doc';
	import SidebarActivity from '$lib/domain/activity/sidebar/SidebarActivity.svelte';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import ServiceMaintenanceListItem from '$lib/domain/list-items/ServiceMaintenanceListItem.svelte';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ManifestCard from '$lib/ui/ManifestCard.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
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
				serviceName: $OpenSearchInstance.data.team.environment.openSearch.name,
				teamSlug: $OpenSearchInstance.data.team.slug,
				environmentName:
					$OpenSearchInstance.data.team.environment.openSearch.teamEnvironment.environment.name
			});
			if (resp.errors) {
				maintenanceError = resp.errors.map((e) => e.message).join(', ');
			} else {
				maintenanceError = resp.data?.startOpenSearchMaintenance?.error;
			}
		}
	};

	let { data }: PageProps = $props();
	let { OpenSearchInstance, viewerIsMember, teamSlug } = $derived(data);

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

	const isManagedByConsole = $derived(
		!$OpenSearchInstance.data?.team.environment.openSearch.name.startsWith(
			`opensearch-${teamSlug}-`
		)
	);
</script>

{#if $OpenSearchInstance.errors}
	<GraphErrors errors={$OpenSearchInstance.errors} />
{:else if $OpenSearchInstance.data}
	{@const instance = $OpenSearchInstance.data.team.environment.openSearch}
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
					This OpenSearch instance is managed outside Console.<br />
					To migrate this instance to Console, see the
					<ExternalLink href={docURL('/persistence/opensearch/how-to/migrate-to-console/')}>
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
						href="/team/{page.params.team}/{page.params.env}/opensearch/{page.params
							.opensearch}/delete"
						icon={TrashIcon}
					>
						Delete
					</Button>
				</div>
			{/if}

			<section aria-labelledby="access-heading">
				<Heading as="h2" id="access-heading" size="medium" spacing
					>OpenSearch Instance Access List</Heading
				>

				{#if instance.access.edges.length > 0}
					<div class="table-scroll" role="region" aria-label="OpenSearch access list">
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
					</div>
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
			</section>

			<section aria-labelledby="issues-heading">
				<Heading as="h2" id="issues-heading" size="medium" spacing>Issues</Heading>
				<List>
					{#each $OpenSearchInstance.data.team.environment.openSearch.issues.edges as edge (edge.node.id)}
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
				title="Use this OpenSearch"
				manifest={`spec:\n  openSearch:\n    - instance: ${instance.name.replace(`opensearch-${teamSlug}-`, '')}`}
			/>

			<SurfaceCard title="State">
				<BodyShort>{instance.state}</BodyShort>
			</SurfaceCard>

			<SurfaceCard title="Settings">
				{#snippet headerAside()}
					{#if viewerIsMember && isManagedByConsole}
						<Button
							as="a"
							variant="secondary"
							size="small"
							href="/team/{page.params.team}/{page.params.env}/opensearch/{page.params
								.opensearch}/edit"
							icon={NotePencilIcon}
						>
							Edit
						</Button>
					{/if}
				{/snippet}
				<dl class="settings-list">
					<dt>Tier</dt>
					<dd>{instance.tier}</dd>
					<dt>Memory</dt>
					<dd>{instance.memory}</dd>
					<dt>Storage</dt>
					<dd>{instance.storageGB}GB</dd>
				</dl>
			</SurfaceCard>

			<SurfaceCard title="Version">
				<BodyShort>{instance.version.actual ?? 'Unknown'}</BodyShort>
			</SurfaceCard>

			{#if instance.maintenance && instance.maintenance.window}
				<SurfaceCard title="Maintenance window">
					<dl class="settings-list">
						<dt>Day of week</dt>
						<dd>{instance.maintenance.window.dayOfWeek}</dd>
						<dt>Time of day</dt>
						<dd>{instance.maintenance.window.timeOfDay.slice(0, -3)}</dd>
					</dl>
				</SurfaceCard>
			{/if}

			<SurfaceCard title="Activity">
				<SidebarActivity activityLog={instance} direct={instance.activityLog} hideTitle />
			</SurfaceCard>
		</div>
	</div>
{/if}

<style>
	.content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
		min-width: 0;
	}

	.service-maintenance-list-heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: var(--ax-space-16);
		gap: var(--ax-space-4);
		flex-wrap: wrap;
	}

	.settings-list {
		display: grid;
		grid-template-columns: 18ch minmax(0, 1fr);
		gap: var(--ax-space-4) var(--ax-space-8);
		margin: 0;
		align-items: baseline;
	}

	.settings-list dt {
		font-weight: var(--ax-font-weight-bold);
		color: var(--ax-text-neutral-subtle);
	}

	.settings-list dd {
		margin: 0;
	}

	@media (max-width: 767px) {
		.service-maintenance-list-heading {
			flex-direction: column;
		}

		.settings-list {
			grid-template-columns: 1fr;
			gap: var(--ax-space-2);
		}

		.settings-list dd {
			margin-bottom: var(--ax-space-4);
		}

		.settings-list dd:last-child {
			margin-bottom: 0;
		}
	}
</style>
