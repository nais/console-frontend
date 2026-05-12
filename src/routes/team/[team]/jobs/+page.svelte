<script lang="ts">
	import { page } from '$app/state';
	import { JobOrderField, OrderDirection, graphql } from '$houdini';
	import { docURL } from '$lib/doc';
	import AggregatedCostForJobs from '$lib/domain/cost/AggregatedCostForJobs.svelte';
	import JobListItem from '$lib/domain/list-items/JobListItem.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SearchField from '$lib/ui/SearchField.svelte';
	import StatusFilterPills from '$lib/ui/StatusFilterPills.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { getLocalizedCronDescription } from '$lib/utils/cron';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Button } from '@nais/ds-svelte-community';
	import { ActionMenu, ActionMenuCheckboxItem } from '@nais/ds-svelte-community/experimental';
	import { CalendarIcon, ChevronDownIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { Jobs, JobsListMetadata, teamSlug } = $derived(data);

	let filter = $state($Jobs.variables?.filter?.name ?? '');

	let after: string = $derived($Jobs.variables?.after ?? '');
	let before: string = $derived($Jobs.variables?.before ?? '');

	const totalJobs = $derived($JobsListMetadata.data?.team.totalJobs.pageInfo.totalCount ?? 0);

	const allEnvs = $derived($Jobs.data?.team.environments.map((env) => env.environment.name) ?? []);

	let filteredEnvs = $derived(page.url.searchParams.get('environments')?.split(',') ?? allEnvs);

	const allStates = ['running', 'completed', 'failed', 'unknown'];
	let activeStatuses = $derived(page.url.searchParams.get('states')?.split(',') ?? allStates);

	let states = $derived({
		running: $JobsListMetadata.data?.team.inventoryCounts?.jobs?.running ?? 0,
		completed: $JobsListMetadata.data?.team.inventoryCounts?.jobs?.completed ?? 0,
		failed: $JobsListMetadata.data?.team.inventoryCounts?.jobs?.failed ?? 0,
		unknown: $JobsListMetadata.data?.team.inventoryCounts?.jobs?.unknown ?? 0
	});

	$effect(() => {
		const environments = filteredEnvs.length === allEnvs.length ? '' : filteredEnvs.join(',');

		if (environments !== (page.url.searchParams.get('environments') ?? '')) {
			changeQuery({ environments });
		}
	});

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
			newFilter?: string;
			environments?: string;
			states?: string;
		} = {}
	) => {
		const currentEnvironments =
			filteredEnvs.length === allEnvs.length ? '' : filteredEnvs.join(',');
		const currentStates =
			activeStatuses.length === allStates.length ? '' : activeStatuses.join(',');
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after,
			filter: params.newFilter ?? filter,
			environments: params.environments ?? currentEnvironments,
			states: params.states ?? currentStates
		});
	};

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
				{#snippet search()}
					<SearchField
						value={filter}
						placeholder="Search jobs..."
						label="Search jobs"
						oninput={(v) => (filter = v)}
						onsubmit={() => changeQuery({ newFilter: filter })}
						onclear={() => {
							filter = '';
							changeQuery({ newFilter: '' });
						}}
					/>
				{/snippet}
				{#snippet filters()}
					<StatusFilterPills
						running={states.running}
						completed={states.completed}
						failed={states.failed}
						unknown={states.unknown}
						{activeStatuses}
						onchange={(s) => {
							const statesValue = s.length === allStates.length ? '' : s.join(',');
							changeQuery({ states: statesValue, after: '', before: '' });
						}}
					/>
				{/snippet}
				{#snippet menu()}
					<ActionMenu>
						{#snippet trigger(props)}
							<Button
								variant="tertiary-neutral"
								size="small"
								iconPosition="right"
								{...props}
								icon={ChevronDownIcon}
							>
								<span style="font-weight: normal">Environment</span>
							</Button>
						{/snippet}
						<ActionMenuCheckboxItem
							checked={allEnvs.length === filteredEnvs.length
								? true
								: filteredEnvs.length > 0
									? 'indeterminate'
									: false}
							onchange={(checked) => (filteredEnvs = checked ? allEnvs : [])}
						>
							All environments
						</ActionMenuCheckboxItem>
						{#each $Jobs.data?.team.environments ?? [] as { environment, id } (id)}
							<ActionMenuCheckboxItem
								checked={filteredEnvs.includes(environment.name)}
								onchange={(checked) =>
									(filteredEnvs = checked
										? [...filteredEnvs, environment.name]
										: filteredEnvs.filter((env) => env !== environment.name))}
							>
								{environment.name}
							</ActionMenuCheckboxItem>
						{/each}
					</ActionMenu>
					<OrderByMenu
						orderField={JobOrderField}
						defaultOrderField={JobOrderField.ISSUES}
						defaultOrderDirection={OrderDirection.DESC}
					/>
				{/snippet}
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
			<BodyLong>
				Jobs are used for one-time or scheduled tasks that run to completion and then exit.
				<ExternalLink href={docURL('/workloads/job')}>Learn more about jobs.</ExternalLink>
			</BodyLong>
		{/if}
	</div>
	<div class="right-column">
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
