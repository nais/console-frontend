<script lang="ts">
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import WorkloadActivityCard from '$lib/domain/activity/WorkloadActivityCard.svelte';
	import CostOverviewChart from '$lib/domain/cost/CostOverviewChart.svelte';
	import CriticalIssuesCard from '$lib/domain/issues/CriticalIssuesCard.svelte';
	import Persistence from '$lib/domain/persistence/Persistence.svelte';
	import Configs from '$lib/domain/resources/Configs.svelte';
	import Secrets from '$lib/domain/resources/Secrets.svelte';
	import JobResources from '$lib/domain/workload/JobResources.svelte';
	import WorkloadDeploy from '$lib/domain/workload/WorkloadDeploy.svelte';
	import WorkloadHealth from '$lib/domain/workload/WorkloadHealth.svelte';
	import Confirm from '$lib/ui/Confirm.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import PageModal from '$lib/ui/PageModal.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { Alert, BodyShort, Heading, Loader } from '@nais/ds-svelte-community';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import EnvPage from './env/+page.svelte';
	import Runs from './Runs.svelte';
	import Schedule from './Schedule.svelte';

	let { data }: PageProps = $props();
	let { Job, JobRunsQuery, teamSlug, viewerIsMember } = $derived(data);

	onMount(() => {
		const interval = setInterval(() => JobRunsQuery.fetch({ policy: 'CacheAndNetwork' }), 10_000);
		return () => clearInterval(interval);
	});

	let jobData = $derived(Job ? $Job.data : undefined);
	let jobErrors = $derived(Job ? $Job.errors : undefined);
	let jobFetching = $derived(Job ? $Job.fetching : false);
	let job = $derived(jobData?.team?.environment?.job ?? null);
	let jobRuns = $derived($JobRunsQuery.data?.team?.environment?.job ?? null);

	const deleteJobRunMutation = graphql(`
		mutation DeleteJobRun($teamSlug: Slug!, $environment: String!, $runName: String!) {
			deleteJobRun(
				input: { teamSlug: $teamSlug, environmentName: $environment, runName: $runName }
			) {
				success
			}
		}
	`);

	let jobName = $derived(page.params.job);
	let environment = $derived(page.params.env);

	let criticalEdges = $derived(
		job?.issues.edges.filter((e) => e.node.severity === 'CRITICAL') ?? []
	);
	let totalRuns = $derived(job?.recentRuns.nodes.length ?? 0);
	let succeededRuns = $derived(
		job?.recentRuns.nodes.filter((n) => n.status.state === 'SUCCEEDED').length ?? 0
	);

	let deleteConfirmOpen = $state(false);
	let deleteRunName = $state('');

	const handleDeleteRun = (runName: string) => {
		deleteRunName = runName;
		deleteConfirmOpen = true;
	};

	const confirmDeleteRun = async () => {
		if (!jobName || !environment) return;

		const resp = await deleteJobRunMutation.mutate({
			teamSlug,
			environment,
			runName: deleteRunName
		});

		if ($deleteJobRunMutation.errors) return;
		if (!resp.data?.deleteJobRun.success) return;

		deleteRunName = '';
		setTimeout(() => JobRunsQuery.fetch({ policy: 'NetworkOnly' }), 500);
	};
</script>

<GraphErrors errors={jobErrors} />

{#if jobFetching}
	<div
		style="display: flex; justify-content: center; align-items: center; height: 500px;"
		role="status"
		aria-label="Loading"
	>
		<Loader size="3xlarge" />
	</div>
{/if}

{#if job}
	<div class="wrapper">
		<div class="job-content">
			<div class="main-section">
				<Heading as="h2" class="aksel-sr-only">Overview</Heading>
				{#if job?.deletionStartedAt}
					<Alert variant="info" size="small" fullWidth={false}>
						This job is being deleted. Deletion started <Time
							time={job.deletionStartedAt}
							distance
						/>. If the deletion is taking too long, contact the Nais team.
					</Alert>
				{/if}
				{#if criticalEdges.length > 0}
					<CriticalIssuesCard
						title={`Critical issues (${criticalEdges.length})`}
						viewAllHref="/team/{page.params.team}/{page.params.env}/job/{page.params.job}/issues"
						issues={criticalEdges}
					/>
				{/if}
				<WorkloadHealth
					{teamSlug}
					environment={environment ?? ''}
					workload={job?.name ?? ''}
					workloadType="job"
					criticalIssues={job?.criticalIssues.pageInfo.totalCount ?? 0}
					warningIssues={job?.warningIssues.pageInfo.totalCount ?? 0}
					todoIssues={job?.todoIssues.pageInfo.totalCount ?? 0}
					{totalRuns}
					{succeededRuns}
					loading={jobFetching}
				/>
				<SurfaceCard>
					{#if jobRuns}
						<Runs job={jobRuns} ondelete={viewerIsMember ? handleDeleteRun : undefined} />
					{/if}
				</SurfaceCard>
				<SurfaceCard>
					<div class="configuration-section">
						<Heading as="h2">Configuration</Heading>
						<Schedule
							schedule={job?.schedule}
							scheduleContext={{
								team: job?.team.slug ?? '',
								environment: job?.teamEnvironment.environment.name ?? '',
								job: job?.name ?? ''
							}}
						/>
						<JobResources requests={job?.resources.requests} limits={job?.resources.limits} />
					</div>
				</SurfaceCard>
				{#if jobName && environment}
					<CostOverviewChart workload={jobName} {environment} {teamSlug} />
				{/if}
			</div>
			<div class="layout-sidebar">
				<WorkloadDeploy workload={job} />
				{#if environment && jobName}
					<WorkloadActivityCard
						{teamSlug}
						env={environment}
						workload={jobName}
						workloadType="job"
						viewAllHref="/team/{teamSlug}/{environment}/job/{jobName}/activity-log"
					/>
				{/if}
				<Persistence workload={job} />
				{#if jobName && environment}
					<Configs workload={jobName} {environment} {teamSlug} />
					<Secrets workload={jobName} {environment} {teamSlug} />
				{/if}
			</div>
		</div>

		<Confirm
			confirmText="Delete"
			variant="danger"
			bind:open={deleteConfirmOpen}
			onconfirm={confirmDeleteRun}
			oncancel={() => {
				deleteRunName = '';
			}}
		>
			{#snippet header()}
				<Heading>Delete job run</Heading>
			{/snippet}
			<GraphErrors errors={$deleteJobRunMutation.errors} />
			<BodyShort>
				Are you sure you want to delete the job run <strong>{deleteRunName}</strong>?
			</BodyShort>
		</Confirm>
		<PageModal content={EnvPage} header="Set environment variables" />
	</div>
{/if}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.main-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.job-content {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--ax-space-16);
	}

	.configuration-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	/* Mobile responsive layout */
	@media (max-width: 767px), (max-height: 500px) {
		.job-content {
			grid-template-columns: 1fr;
			gap: var(--spacing-layout);
		}
	}
</style>
