<script lang="ts">
	import { page } from '$app/state';
	import {
		graphql,
		JobOrderField,
		OrderDirection,
		type JobOrderField$options,
		type OrderDirection$options
	} from '$houdini';
	import AggregatedCostForJobs from '$lib/domain/cost/AggregatedCostForJobs.svelte';
	import JobListItem from '$lib/domain/list-items/JobListItem.svelte';
	import WorkloadListFilters from '$lib/domain/workload/WorkloadListFilters.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { getLocalizedCronDescription } from '$lib/utils/cron';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong } from '@nais/ds-svelte-community';
	import { CalendarIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { Jobs, JobsListMetadata, teamSlug } = $derived(data);

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

	const sortFields: { value: JobOrderField$options; label: string }[] = [
		{ value: JobOrderField.ISSUES, label: 'Issues' },
		{ value: JobOrderField.NAME, label: 'Name' },
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

	const scheduledJobsQuery = graphql(`
		query JobQueueScheduled($team: Slug!) @cache(policy: CacheAndNetwork) {
			team(slug: $team) {
				jobs(first: 500) {
					nodes {
						name
						schedule {
							expression
							timeZone
						}
						teamEnvironment {
							environment {
								name
							}
						}
					}
				}
			}
		}
	`);

	$effect(() => {
		scheduledJobsQuery.fetch({ variables: { team: teamSlug } });
	});

	let jobQueue = $derived.by(() => {
		const nodes = $scheduledJobsQuery.data?.team?.jobs?.nodes ?? [];
		return nodes
			.filter((j) => j.schedule)
			.map((j) => {
				const result = getLocalizedCronDescription({
					expression: j.schedule!.expression,
					timeZone: j.schedule!.timeZone,
					context: { team: teamSlug, environment: j.teamEnvironment.environment.name, job: j.name }
				});
				return {
					name: j.name,
					env: j.teamEnvironment.environment.name,
					nextRun: result.nextRun,
					nextRunDate: result.nextRunDate,
					description: result.description
				};
			})
			.filter((j) => j.nextRunDate)
			.sort((a, b) => a.nextRunDate!.getTime() - b.nextRunDate!.getTime())
			.slice(0, 5);
	});
</script>

<GraphErrors errors={$Jobs.errors} />

<div class="wrapper">
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
	<div class="right-column">
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
				{selectedStates}
				{selectedEnvironments}
				onFilterInput={(v) => (filter = v)}
				onFilterSubmit={() => changeQuery({ newFilter: filter })}
				onFilterClear={() => {
					filter = '';
					changeQuery({ newFilter: '' });
				}}
				onSort={(field) => setSort(field as JobOrderField$options)}
				onStatesChange={handleStatesChange}
				onEnvironmentsChange={handleEnvironmentsChange}
			/>
		</SurfaceCard>
		{#if jobQueue.length > 0}
			<SurfaceCard title="Job queue">
				<ul class="job-queue">
					{#each jobQueue as item (item.name + item.env)}
						<li class="queue-item">
							<CalendarIcon width="16" height="16" />
							<div class="queue-details">
								<span class="queue-name">{item.name} - {item.env}</span>
								<span class="queue-next">{item.nextRun}</span>
							</div>
						</li>
					{/each}
				</ul>
			</SurfaceCard>
		{/if}
		{#if totalJobs > 0}
			<SurfaceCard title="Cost">
				<AggregatedCostForJobs {teamSlug} totalCount={totalJobs} />
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

	@media (max-width: 767px) {
		.wrapper {
			grid-template-columns: 1fr;
			gap: var(--ax-space-24);
		}
	}

	@media (max-height: 500px) {
		.wrapper {
			grid-template-columns: 1fr;
			gap: var(--ax-space-24);
		}
	}

	.job-queue {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-12);
	}

	.queue-item {
		display: flex;
		align-items: flex-start;
		gap: var(--ax-space-8);
		color: var(--ax-text-neutral);
	}

	.queue-item :global(svg) {
		flex-shrink: 0;
		margin-top: 2px;
		color: var(--ax-text-neutral);
	}

	.queue-details {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-2);
		min-width: 0;
	}

	.queue-name {
		font-weight: 500;
		font-size: var(--ax-font-size-small);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.queue-next {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
	}
</style>
