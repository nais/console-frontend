<script lang="ts">
	import { page } from '$app/state';
	import { JobOrderField, OrderDirection, graphql } from '$houdini';
	import { docURL } from '$lib/doc';
	import AggregatedCostForJobs from '$lib/domain/cost/AggregatedCostForJobs.svelte';
	import JobListItem from '$lib/domain/list-items/JobListItem.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import ListV2 from '$lib/ui/ListV2.svelte';
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
		} = {}
	) => {
		const currentEnvironments =
			filteredEnvs.length === allEnvs.length ? '' : filteredEnvs.join(',');
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after,
			filter: params.newFilter ?? filter,
			environments: params.environments ?? currentEnvironments
		});
	};

	// TODO: Replace client-side state filtering with server-side filtering once
	// nais/api#429 adds `states` to TeamJobsFilter.
	const stateQuery = graphql(`
		query JobStateOverviewV2($team: Slug!) @cache(policy: CacheAndNetwork) {
			team(slug: $team) {
				jobs(first: 500) {
					nodes {
						state
					}
					pageInfo {
						totalCount
					}
				}
			}
		}
	`);

	$effect(() => {
		stateQuery.fetch({ variables: { team: teamSlug } });
	});

	let states = $derived.by(() => {
		const nodes = $stateQuery.data?.team?.jobs?.nodes ?? [];
		const running = nodes.filter((n) => n.state === 'RUNNING').length;
		const completed = nodes.filter((n) => n.state === 'COMPLETED').length;
		const failed = nodes.filter((n) => n.state === 'FAILED').length;
		const unknown = nodes.filter((n) => n.state === 'UNKNOWN').length;
		return { running, completed, failed, unknown };
	});

	let activeStatuses = $state<string[]>(['running', 'completed', 'failed', 'unknown']);

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
					description: result.description
				};
			})
			.filter((j) => j.nextRun)
			.sort((a, b) => (a.nextRun! < b.nextRun! ? -1 : 1))
			.slice(0, 5);
	});
</script>

<GraphErrors errors={$Jobs.errors} />

<div class="wrapper">
	<div>
		{#if totalJobs > 0}
			{@const jobs = $Jobs.data?.team.jobs}

			<ListV2 title="Jobs" count={jobs?.pageInfo.totalCount ?? 0}>
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
						onchange={(s) => (activeStatuses = s)}
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
					{@const stateKey =
						{ RUNNING: 'running', COMPLETED: 'completed', FAILED: 'failed', UNKNOWN: 'unknown' }[
							job.state
						] ?? 'unknown'}
					{#if activeStatuses.includes(stateKey)}
						<JobListItem {job} />
					{/if}
				{/each}
			</ListV2>
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
		<SurfaceCard title="About">
			<BodyLong>
				Jobs are used for one-time or scheduled tasks that run to completion and then exit.
				<ExternalLink href={docURL('/workloads/job')}>Learn more about jobs.</ExternalLink>
			</BodyLong>
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
		grid-template-columns: 1fr 300px;
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
