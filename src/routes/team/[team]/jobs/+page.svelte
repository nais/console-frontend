<script lang="ts">
	import { page } from '$app/state';
	import {
		JobOrderField,
		OrderDirection,
		type JobOrderField$options,
		type OrderDirection$options
	} from '$houdini';
	import JobListItem from '$lib/domain/list-items/JobListItem.svelte';
	import WorkloadListFilters from '$lib/domain/workload/WorkloadListFilters.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { Jobs, JobsListMetadata } = $derived(data);

	let filter = $state($Jobs.variables?.filter?.name ?? '');

	let after: string = $derived($Jobs.variables?.after ?? '');
	let before: string = $derived($Jobs.variables?.before ?? '');

	const totalJobs = $derived($JobsListMetadata.data?.team.totalJobs.pageInfo.totalCount ?? 0);

	let selectedEnvironments: string[] = $derived(
		page.url.searchParams.get('environments')?.split(',').filter(Boolean) ?? []
	);

	let selectedStates: string[] = $derived(
		page.url.searchParams.get('states')?.split(',').filter(Boolean) ?? []
	);

	let selectedLabels: string[] = $derived(
		page.url.searchParams.get('labels')?.split(',').filter(Boolean) ?? []
	);

	const sortFields: { value: JobOrderField$options; label: string }[] = [
		{ value: JobOrderField.ISSUES, label: 'Issues' },
		{ value: JobOrderField.NAME, label: 'Name' },
		{ value: JobOrderField.NEXT_RUN, label: 'Next run' },
		{ value: JobOrderField.DEPLOYMENT_TIME, label: 'Deploy time' },
		{ value: JobOrderField.ENVIRONMENT, label: 'Environment' },
		{ value: JobOrderField.STATE, label: 'State' }
	];

	const currentSortField: JobOrderField$options = $derived(
		(Object.values(JobOrderField).find((f) => page.url.searchParams.get('sort')?.startsWith(f)) as
			| JobOrderField$options
			| undefined) ?? JobOrderField.ISSUES
	);

	const currentSortDirection: OrderDirection$options = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			| OrderDirection$options
			| undefined) ?? OrderDirection.DESC
	);

	function setSort(field: JobOrderField$options) {
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
		{#if totalJobs > 0}
			{@const jobs = $Jobs.data?.team.jobs}

			<List title="Jobs" count={jobs?.pageInfo.totalCount ?? 0}>
				{#each jobs?.nodes ?? [] as job (job.id)}
					<JobListItem {job} />
				{/each}
			</List>
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
		{:else}
			<BodyLong><strong>No jobs found.</strong></BodyLong>
		{/if}
	</div>
	<div class="layout-sidebar">
		<SurfaceCard title="Filters">
			<WorkloadListFilters
				{filter}
				searchPlaceholder="Search jobs..."
				searchLabel="Search jobs"
				{sortFields}
				{currentSortField}
				{currentSortDirection}
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
				onSort={(field) => setSort(field as JobOrderField$options)}
				onStatesChange={handleStatesChange}
				onEnvironmentsChange={handleEnvironmentsChange}
				onLabelsChange={handleLabelsChange}
			/>
		</SurfaceCard>
	</div>
</div>

<style>
</style>
