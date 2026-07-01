<script lang="ts">
	import { page } from '$app/state';
	import {
		ApplicationOrderField,
		OrderDirection,
		type ApplicationOrderField$options,
		type OrderDirection$options
	} from '$houdini';
	import AppListItem from '$lib/domain/list-items/AppListItem.svelte';
	import WorkloadListFilters from '$lib/domain/workload/WorkloadListFilters.svelte';
	import CollapsibleSidebar from '$lib/ui/CollapsibleSidebar.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong } from '@nais/ds-svelte-community';
	import { FunnelIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { Applications } = $derived(data);

	let filtersOpen = $state(false);

	let filter = $state($Applications.variables?.filter?.name ?? '');

	let after: string = $derived($Applications.variables?.after ?? '');
	let before: string = $derived($Applications.variables?.before ?? '');

	const totalApplications = $derived(
		$Applications.data?.team.applications.pageInfo.totalCount ?? 0
	);

	let selectedEnvironments: string[] = $derived(
		page.url.searchParams.get('environments')?.split(',').filter(Boolean) ?? []
	);

	let selectedStates: string[] = $derived(
		page.url.searchParams.get('states')?.split(',').filter(Boolean) ?? []
	);

	let selectedLabels: string[] = $derived(
		page.url.searchParams.get('labels')?.split(',').filter(Boolean) ?? []
	);

	const hasActiveFilters = $derived(
		!!page.url.searchParams.get('filter') ||
			selectedEnvironments.length > 0 ||
			selectedStates.length > 0 ||
			selectedLabels.length > 0
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
		const defaultDirection =
			field === ApplicationOrderField.NAME || field === ApplicationOrderField.ENVIRONMENT
				? OrderDirection.ASC
				: OrderDirection.DESC;
		const direction =
			field === currentSortField
				? currentSortDirection === OrderDirection.ASC
					? OrderDirection.DESC
					: OrderDirection.ASC
				: defaultDirection;
		changeParams({ sort: `${field}-${direction}`, after: '', before: '' }, { noScroll: true });
	}

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
			newFilter?: string;
			environments?: string;
			states?: string;
			labels?: string;
		} = {}
	) => {
		changeParams(
			{
				before: params.before ?? before,
				after: params.after ?? after,
				filter: params.newFilter ?? filter,
				environments: params.environments ?? (selectedEnvironments.join(',') || ''),
				states: params.states ?? (selectedStates.join(',') || ''),
				labels: params.labels ?? (selectedLabels.join(',') || '')
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

	function handleLabelsChange(selected: string[]) {
		changeQuery({
			labels: selected.join(','),
			after: '',
			before: ''
		});
	}
</script>

<GraphErrors errors={$Applications.errors} />

<div class="layout-two-column">
	<div>
		{#if totalApplications > 0}
			{@const apps = $Applications.data?.team.applications}

			<List title="Apps" count={apps?.pageInfo.totalCount ?? 0}>
				{#snippet actions()}
					<button
						type="button"
						class="sidebar-toggle"
						aria-expanded={filtersOpen}
						onclick={() => (filtersOpen = !filtersOpen)}
					>
						<FunnelIcon aria-hidden="true" style="font-size: 1rem" />
						Filters
					</button>
				{/snippet}
				{#each apps?.edges ?? [] as { node: app } (app.id)}
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
			<BodyLong>
				<strong>
					{#if hasActiveFilters}
						No applications match your filters.
					{:else}
						No applications found.
					{/if}
				</strong>
			</BodyLong>
		{/if}
	</div>
	<CollapsibleSidebar bind:open={filtersOpen}>
		<SurfaceCard title="Filters">
			<WorkloadListFilters
				{filter}
				searchPlaceholder="Search apps..."
				searchLabel="Search applications"
				{sortFields}
				{currentSortField}
				{currentSortDirection}
				states={$Applications.data?.team.applications.facets?.states ?? []}
				environments={$Applications.data?.team.applications.facets?.environments ?? []}
				labels={$Applications.data?.team.applications.facets?.labels ?? []}
				{selectedStates}
				{selectedEnvironments}
				{selectedLabels}
				onFilterInput={(v) => (filter = v)}
				onFilterSubmit={() => changeQuery({ newFilter: filter })}
				onFilterClear={() => {
					filter = '';
					changeQuery({ newFilter: '' });
				}}
				onSort={(field) => setSort(field as ApplicationOrderField$options)}
				onStatesChange={handleStatesChange}
				onEnvironmentsChange={handleEnvironmentsChange}
				onLabelsChange={handleLabelsChange}
			/>
		</SurfaceCard>
	</CollapsibleSidebar>
</div>

<style>
</style>
