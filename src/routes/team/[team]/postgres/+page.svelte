<script lang="ts">
	import { page } from '$app/state';
	import { docURL } from '#lib/doc.js';
	import LabelFacets from '#lib/domain/labels/LabelFacets.svelte';
	import { envTagVariant } from '#lib/envTagVariant.js';
	import PostgreSQLIcon from '#lib/icons/PostgreSQLIcon.svelte';
	import CollapsibleSidebar from '#lib/ui/CollapsibleSidebar.svelte';
	import ExternalLink from '#lib/ui/ExternalLink.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import Collection from '#lib/ui/Collection.svelte';
	import ResourceTable from '#lib/ui/ResourceTable.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import StatusIndicator from '#lib/ui/StatusIndicator.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { Alert, Button, Checkbox, Loader, Tag, Td, Th, Tr } from '#lib/shadcn/ui/index.js';
	import { FunnelIcon } from '#lib/icons/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TeamPostgres } = $derived(data);
	let filtersOpen = $state(false);
	let hasSupportedEnvironment = $derived(
		($TeamPostgres.data?.team.environments ?? []).some(
			(teamEnvironment) => !!teamEnvironment.gcpProjectID
		)
	);
	const selectedEnvironments = $derived(
		page.url.searchParams.get('environments')?.split(',').filter(Boolean) ?? []
	);
	const selectedLabels = $derived(
		page.url.searchParams.get('labels')?.split(',').filter(Boolean) ?? []
	);

	function toggleEnvironment(environment: string) {
		const next = selectedEnvironments.includes(environment)
			? selectedEnvironments.filter((selected) => selected !== environment)
			: [...selectedEnvironments, environment];
		changeParams({ environments: next.join(','), after: '', before: '' }, { noScroll: true });
	}

	function handleLabelsChange(selected: string[]) {
		changeParams({ labels: selected.join(','), after: '', before: '' }, { noScroll: true });
	}
</script>

<GraphErrors errors={$TeamPostgres.errors} />
{#if page.url.searchParams.get('deletionRequested')}
	<div class="deletion-alert">
		<Alert variant="success">
			Deletion requested for {page.url.searchParams.get('deletionRequested')}. Cleanup is
			asynchronous; the database may remain in this list until it completes.
		</Alert>
	</div>
{/if}

{#if $TeamPostgres.fetching && !$TeamPostgres.data}
	<div class="loading-centered" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if $TeamPostgres.data}
	{const postgreses = $derived($TeamPostgres.data.team.postgreses)}
	<div class="layout-two-column">
		<div>
			<Collection
				title="Postgres"
				icon={PostgreSQLIcon}
				headerBorder={false}
				count={postgreses.pageInfo.totalCount}
			>
				{#snippet actions()}
					{#if (data.viewerIsMember || data.isAdmin) && hasSupportedEnvironment}
						<Button
							as="a"
							href="/team/{page.params.team}/postgres/create"
							size="small"
							variant="secondary">Create Postgres</Button
						>
					{/if}
					<button
						type="button"
						class="sidebar-toggle"
						aria-expanded={filtersOpen}
						onclick={() => (filtersOpen = !filtersOpen)}
					>
						<FunnelIcon aria-hidden="true" style="font-size: var(--ax-font-size-medium)" />
						Filters
					</button>
				{/snippet}
				{#if postgreses.pageInfo.totalCount > 0}
					<ResourceTable label="Postgres">
						{#snippet header()}
							<Th class="status-column">Status</Th>
							<Th>Name</Th>
							<Th>Env</Th>
							<Th>Version</Th>
						{/snippet}
						{#each postgreses.edges as { node: postgres } (postgres.id)}
							{const state = $derived(
								postgres.desiredActiveBranch &&
									postgres.desiredActiveBranch !== postgres.activeBranch?.name
									? 'PROGRESSING'
									: (postgres.activeBranch?.state ?? 'PROGRESSING')
							)}
							<Tr>
								<Td
									><div class="status-cell">
										<StatusIndicator
											label={state.toLowerCase()}
											tone={state === 'AVAILABLE'
												? 'success'
												: state === 'DEGRADED'
													? 'danger'
													: 'warning'}
										/>
									</div></Td
								>
								<Td
									><a
										class="resource-name"
										href="/team/{page.params.team}/{postgres.teamEnvironment.environment
											.name}/postgres/{postgres.name}">{postgres.name}</a
									></Td
								>
								<Td>
									<Tag
										size="xsmall"
										variant={envTagVariant(postgres.teamEnvironment.environment.name)}
										>{postgres.teamEnvironment.environment.name}</Tag
									>
								</Td>
								<Td><span class="table-meta">{postgres.majorVersion}</span></Td>
							</Tr>
						{/each}
					</ResourceTable>
				{:else}
					<p>
						No Postgres found. Postgres provides managed relational databases in the cloud.
						<ExternalLink href={docURL('/persistence/postgresql')}
							>Learn more about Postgres in Nais and how to get started.</ExternalLink
						>
					</p>
				{/if}
			</Collection>
			<Pagination
				page={postgreses.pageInfo}
				loaders={{
					loadPreviousPage: () =>
						changeParams(
							{ after: '', before: postgreses.pageInfo.startCursor ?? '' },
							{ noScroll: true }
						),
					loadNextPage: () =>
						changeParams(
							{ before: '', after: postgreses.pageInfo.endCursor ?? '' },
							{ noScroll: true }
						)
				}}
			/>
		</div>
		<CollapsibleSidebar bind:open={filtersOpen}>
			<SurfaceCard title="Filters">
				<details class="filter-section" open>
					<summary class="section-heading">Environments</summary>
					<div class="facet-list">
						{#each $TeamPostgres.data.team.environments as teamEnvironment (teamEnvironment.environment.name)}
							<Checkbox
								size="small"
								checked={selectedEnvironments.includes(teamEnvironment.environment.name)}
								onchange={() => toggleEnvironment(teamEnvironment.environment.name)}
							>
								<span class="facet-label">{teamEnvironment.environment.name}</span>
							</Checkbox>
						{/each}
					</div>
				</details>
				{#if postgreses.facets.labels.length > 0}
					<LabelFacets
						labels={postgreses.facets.labels}
						{selectedLabels}
						onLabelsChange={handleLabelsChange}
					/>
				{/if}
			</SurfaceCard>
		</CollapsibleSidebar>
	</div>
{/if}

<style>
	.deletion-alert {
		margin-bottom: var(--ax-space-24);
	}
</style>
