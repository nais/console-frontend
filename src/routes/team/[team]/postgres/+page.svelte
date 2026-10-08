<script lang="ts">
	import { page } from '$app/state';
	import { docURL } from '#lib/doc.js';
	import LabelFacets from '#lib/domain/labels/LabelFacets.svelte';
	import { envTagVariant } from '#lib/envTagVariant.js';
	import CollapsibleSidebar from '#lib/ui/CollapsibleSidebar.svelte';
	import ExternalLink from '#lib/ui/ExternalLink.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import List from '#lib/ui/List.svelte';
	import ListItem from '#lib/ui/ListItem.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import TooltipAlignHack from '#lib/ui/TooltipAlignHack.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { Alert, Button, Checkbox, Loader, Tag } from '@nais/ds-svelte-community';
	import { CircleFillIcon, FunnelIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TeamPostgres } = $derived(data);
	let filtersOpen = $state(false);
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
	<Alert variant="success">
		Deletion requested for {page.url.searchParams.get('deletionRequested')}. Cleanup is
		asynchronous; the database may remain in this list until it completes.
	</Alert>
{/if}

{#if $TeamPostgres.fetching && !$TeamPostgres.data}
	<div class="loading-centered" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if $TeamPostgres.data}
	{const postgreses = $derived($TeamPostgres.data.team.postgreses)}
	<div class="layout-two-column">
		<div>
			<List title="Postgres" count={postgreses.pageInfo.totalCount}>
				{#snippet actions()}
					{#if data.viewerIsMember || data.isAdmin}
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
				{#each postgreses.edges as { node: postgres } (postgres.id)}
					{const state = $derived(
						postgres.desiredActiveBranch &&
							postgres.desiredActiveBranch !== postgres.activeBranch?.name
							? 'PROGRESSING'
							: (postgres.activeBranch?.state ?? 'PROGRESSING')
					)}
					<ListItem
						interactive
						href="/team/{page.params.team}/{postgres.teamEnvironment.environment
							.name}/postgres/{postgres.name}"
					>
						<div class="name-group">
							<TooltipAlignHack content={state.toLowerCase()}>
								<CircleFillIcon
									aria-label={state.toLowerCase()}
									style="color: var({{
										AVAILABLE: '--ax-bg-success-strong',
										DEGRADED: '--ax-bg-danger-strong',
										PROGRESSING: '--ax-bg-warning-moderate-pressed'
									}[state]}); font-size: var(--ax-font-size-small)"
								/>
							</TooltipAlignHack>
							<span class="item-name">{postgres.name}</span>
							<Tag size="xsmall" variant={envTagVariant(postgres.teamEnvironment.environment.name)}
								>{postgres.teamEnvironment.environment.name}</Tag
							>
						</div>
						<div class="right">Version: <code>{postgres.majorVersion}</code></div>
					</ListItem>
				{:else}
					<ListItem>
						<p>
							No Postgres found. Postgres provide managed relational databases in the cloud.
							<ExternalLink href={docURL('/persistence/postgresql')}
								>Learn more about Postgres in Nais and how to get started.</ExternalLink
							>
						</p>
					</ListItem>
				{/each}
			</List>
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
	.right {
		text-align: right;
	}
	@container (max-width: 500px) {
		.right {
			margin-top: var(--ax-space-6);
		}
	}
	.name-group {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		min-width: 0;
	}
	.name-group :global(.aksel-tag) {
		white-space: nowrap;
		flex-shrink: 0;
	}
	.item-name {
		color: var(--ax-text-neutral);
		font-weight: var(--ax-font-weight-bold);
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}
	code {
		font-size: var(--ax-font-size-small);
	}
</style>
