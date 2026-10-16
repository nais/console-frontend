<script lang="ts">
	import { page } from '$app/state';
	import {
		JobOrderField,
		OrderDirection,
		type JobOrderField$options,
		type OrderDirection$options
	} from '$houdini';
	import JobTableRow from '#lib/domain/workload/JobTableRow.svelte';
	import WorkloadListFilters from '#lib/domain/workload/WorkloadListFilters.svelte';
	import CollapsibleSidebar from '#lib/ui/CollapsibleSidebar.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import Collection from '#lib/ui/Collection.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import ResourceTable from '#lib/ui/ResourceTable.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { BodyLong, Th, type TableSortState } from '@nais/ds-svelte-community';
	import { BriefcaseClockIcon, FunnelIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { Jobs } = $derived(data);

	let filtersOpen = $state(false);

	let filter = $state($Jobs.variables?.filter?.name ?? '');

	let after: string = $derived($Jobs.variables?.after ?? '');
	let before: string = $derived($Jobs.variables?.before ?? '');

	const totalJobs = $derived($Jobs.data?.team.jobs.pageInfo.totalCount ?? 0);

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

	const currentSortField: JobOrderField$options = $derived(
		(Object.values(JobOrderField).find((f) => page.url.searchParams.get('sort')?.startsWith(f)) as
			JobOrderField$options | undefined) ?? JobOrderField.ISSUES
	);

	const currentSortDirection: OrderDirection$options = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			OrderDirection$options | undefined) ?? OrderDirection.DESC
	);

	const tableSort: TableSortState = $derived({
		orderBy: currentSortField,
		direction: currentSortDirection === OrderDirection.ASC ? 'ascending' : 'descending'
	});

	function setSort(key: string) {
		const field = Object.values(JobOrderField).find((field) => field === key);
		if (!field) throw new Error(`Unsupported job sort field: ${key}`);
		const defaultDirection =
			field === JobOrderField.NAME ||
			field === JobOrderField.ENVIRONMENT ||
			field === JobOrderField.NEXT_RUN
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

<GraphErrors errors={$Jobs.errors} />

<div class="layout-two-column">
	<div>
		{const jobs = $derived($Jobs.data?.team.jobs)}

		<Collection
			title="Jobs"
			icon={BriefcaseClockIcon}
			headerBorder={false}
			count={jobs?.pageInfo.totalCount ?? 0}
		>
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
			{#if totalJobs > 0}
				<ResourceTable label="Jobs" sort={tableSort} onsortchange={setSort}>
					{#snippet header()}
						<Th class="status-column" sortable sortKey={JobOrderField.STATE}>Status</Th>
						<Th sortable sortKey={JobOrderField.NAME}>Name</Th>
						<Th sortable sortKey={JobOrderField.ENVIRONMENT}>Env</Th>
						<Th sortable sortKey={JobOrderField.ISSUES}>Issues</Th>
						<Th>Last run</Th>
						<Th sortable sortKey={JobOrderField.NEXT_RUN}>Next run</Th>
						<Th sortable sortKey={JobOrderField.DEPLOYMENT_TIME}>Deployed</Th>
					{/snippet}
					{#each jobs?.edges ?? [] as { node: job } (job.id)}
						<JobTableRow {job} />
					{/each}
				</ResourceTable>
			{:else}
				<BodyLong>
					<strong>
						{#if hasActiveFilters}
							No jobs match your filters.
						{:else}
							No jobs found.
						{/if}
					</strong>
				</BodyLong>
			{/if}
		</Collection>
		{#if totalJobs > 0}
			<Pagination
				page={jobs?.pageInfo}
				loaders={{
					loadPreviousPage: () => {
						changeQuery({ after: '', before: jobs?.pageInfo.startCursor ?? '' });
					},
					loadNextPage: () => {
						changeQuery({ before: '', after: jobs?.pageInfo.endCursor ?? '' });
					}
				}}
			/>
		{/if}
	</div>
	<CollapsibleSidebar bind:open={filtersOpen}>
		<SurfaceCard title="Filters">
			<WorkloadListFilters
				{filter}
				searchPlaceholder="Search jobs..."
				searchLabel="Search jobs"
				states={$Jobs.data?.team.jobs.facets?.states ?? []}
				environments={$Jobs.data?.team.jobs.facets?.environments ?? []}
				labels={$Jobs.data?.team.jobs.facets?.labels ?? []}
				{selectedStates}
				{selectedEnvironments}
				{selectedLabels}
				onFilterInput={(v) => (filter = v)}
				onFilterSubmit={() => changeQuery({ newFilter: filter })}
				onFilterClear={() => {
					filter = '';
					changeQuery({ newFilter: '' });
				}}
				onStatesChange={handleStatesChange}
				onEnvironmentsChange={handleEnvironmentsChange}
				onLabelsChange={handleLabelsChange}
			/>
		</SurfaceCard>
	</CollapsibleSidebar>
</div>
