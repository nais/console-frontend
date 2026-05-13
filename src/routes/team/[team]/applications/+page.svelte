<script lang="ts">
	import { page } from '$app/state';
	import {
		ApplicationOrderField,
		OrderDirection,
		type ApplicationOrderField$options,
		type OrderDirection$options
	} from '$houdini';
	import AppListFacets from '$lib/domain/applications/AppListFacets.svelte';
	import AggregatedCostForApplications from '$lib/domain/cost/AggregatedCostForApplications.svelte';
	import AppListItem from '$lib/domain/list-items/AppListItem.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SearchField from '$lib/ui/SearchField.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong } from '@nais/ds-svelte-community';

	import { SortDownIcon, SortUpIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { Applications, ApplicationsListMetadata, teamSlug } = $derived(data);

	let filter = $state($Applications.variables?.filter?.name ?? '');

	let after: string = $derived($Applications.variables?.after ?? '');
	let before: string = $derived($Applications.variables?.before ?? '');

	const totalApplications = $derived(
		$ApplicationsListMetadata.data?.team.totalApplications.pageInfo.totalCount ?? 0
	);

	let selectedEnvironments: string[] = $derived(
		page.url.searchParams.get('environments')?.split(',').filter(Boolean) ?? []
	);

	let selectedStates: string[] = $derived(
		page.url.searchParams.get('states')?.split(',').filter(Boolean) ?? []
	);

	const sortFields: { value: ApplicationOrderField$options; label: string }[] = [
		{ value: ApplicationOrderField.ISSUES, label: 'Issues' },
		{ value: ApplicationOrderField.NAME, label: 'Name' },
		{ value: ApplicationOrderField.DEPLOYMENT_TIME, label: 'Deploy time' },
		{ value: ApplicationOrderField.ENVIRONMENT, label: 'Environment' },
		{ value: ApplicationOrderField.STATE, label: 'State' }
	];

	const currentSortField: ApplicationOrderField$options = $derived(
		(Object.values(ApplicationOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as ApplicationOrderField$options | undefined) ?? ApplicationOrderField.ISSUES
	);

	const currentSortDirection: OrderDirection$options = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			| OrderDirection$options
			| undefined) ?? OrderDirection.DESC
	);

	function setSort(field: ApplicationOrderField$options) {
		const direction =
			field === currentSortField
				? currentSortDirection === OrderDirection.ASC
					? OrderDirection.DESC
					: OrderDirection.ASC
				: OrderDirection.DESC;
		changeParams({ sort: `${field}-${direction}`, after: '', before: '' }, { noScroll: true });
	}

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
			newFilter?: string;
			environments?: string;
			states?: string;
		} = {}
	) => {
		changeParams(
			{
				before: params.before ?? before,
				after: params.after ?? after,
				filter: params.newFilter ?? filter,
				environments: params.environments ?? (selectedEnvironments.join(',') || ''),
				states: params.states ?? (selectedStates.join(',') || '')
			},
			{ noScroll: true }
		);
	};

	function handleStatesChange(selected: string[]) {
		changeQuery({
			states: selected.join(','),
			after: '',
			before: ''
		});
	}

	function handleEnvironmentsChange(selected: string[]) {
		changeQuery({
			environments: selected.join(','),
			after: '',
			before: ''
		});
	}
</script>

<GraphErrors errors={$Applications.errors} />

<div class="wrapper">
	<div>
		{#if totalApplications > 0}
			{@const apps = $Applications.data?.team.applications}

			<List title="Apps" count={apps?.pageInfo.totalCount ?? 0}>
				{#each apps?.nodes ?? [] as app (app.id)}
					<AppListItem {app} />
				{/each}
			</List>
			<Pagination
				page={apps?.pageInfo}
				loaders={{
					loadPreviousPage: () => {
						changeQuery({ before: apps?.pageInfo.startCursor ?? '', after: '' });
					},
					loadNextPage: () => {
						changeQuery({ after: apps?.pageInfo.endCursor ?? '', before: '' });
					}
				}}
			/>
		{:else}
			<BodyLong><strong>No applications found.</strong></BodyLong>
		{/if}
	</div>
	<div class="right-column">
		<SurfaceCard title="Filters">
			<div class="sidebar-section">
				<SearchField
					value={filter}
					placeholder="Search apps..."
					label="Search applications"
					oninput={(v) => (filter = v)}
					onsubmit={() => changeQuery({ newFilter: filter })}
					onclear={() => {
						filter = '';
						changeQuery({ newFilter: '' });
					}}
				/>
			</div>

			<details class="sidebar-section" open>
				<summary class="section-heading">Sort By</summary>
				<div class="sort-options">
					{#each sortFields as { value, label } (value)}
						{@const isActive = currentSortField === value}
						<button
							type="button"
							class="sort-option"
							class:active={isActive}
							onclick={() => setSort(value)}
						>
							<span class="sort-option-label">{label}</span>
							{#if isActive}
								<span class="sort-direction">
									{#if currentSortDirection === 'ASC'}
										<SortUpIcon />
									{:else}
										<SortDownIcon />
									{/if}
								</span>
							{/if}
						</button>
					{/each}
				</div>
			</details>

			{#if $Applications.data?.team.applications.facets}
				<AppListFacets
					states={$Applications.data.team.applications.facets.states}
					environments={$Applications.data.team.applications.facets.environments}
					{selectedStates}
					{selectedEnvironments}
					onStatesChange={handleStatesChange}
					onEnvironmentsChange={handleEnvironmentsChange}
				/>
			{/if}
		</SurfaceCard>
		{#if totalApplications > 0}
			<SurfaceCard title="Cost">
				<AggregatedCostForApplications {teamSlug} totalCount={totalApplications} />
			</SurfaceCard>
		{/if}
	</div>
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 300px;
		gap: var(--spacing-layout);
	}

	.right-column {
		display: grid;
		gap: var(--ax-space-24);
		align-content: start;
	}

	.sidebar-section {
		margin-bottom: var(--ax-space-16);
	}

	.section-heading {
		font-size: var(--ax-font-size-small);
		font-weight: 600;
		color: var(--ax-text-neutral-subtle);
		margin: 0 0 var(--ax-space-8) 0;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		border-bottom: 1px solid var(--ax-border-neutral-subtleA);
		padding-bottom: var(--ax-space-8);
		cursor: pointer;
		list-style: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.section-heading::-webkit-details-marker {
		display: none;
	}

	.section-heading::after {
		content: '';
		width: 0.4em;
		height: 0.4em;
		border-right: 2px solid currentColor;
		border-bottom: 2px solid currentColor;
		transform: rotate(45deg);
		transition: transform 150ms ease;
		flex-shrink: 0;
	}

	.sidebar-section[open] > .section-heading::after {
		transform: rotate(-135deg);
	}

	.sort-options {
		display: flex;
		flex-direction: column;
	}

	.sort-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-8);
		padding: var(--ax-space-6) var(--ax-space-8);
		border: none;
		border-radius: var(--ax-radius-8);
		background: transparent;
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
		cursor: pointer;
		text-align: left;
		transition: background-color 120ms ease;
	}

	.sort-option:hover {
		background: var(--ax-bg-neutral-moderate);
	}

	.sort-option.active {
		font-weight: 600;
		color: var(--ax-text-accent);
	}

	.sort-direction {
		font-size: var(--ax-font-size-small);
		font-weight: 600;
	}

	/* Mobile responsive layout */
	@media (max-width: 767px) {
		.wrapper {
			grid-template-columns: 1fr;
			gap: var(--ax-space-24);
		}
	}

	/* Landscape on mobile phones: keep single column despite wider viewport */
	@media (max-height: 500px) {
		.wrapper {
			grid-template-columns: 1fr;
			gap: var(--ax-space-24);
		}
	}
</style>
