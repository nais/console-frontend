<script lang="ts">
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import WorkloadActivityCard from '$lib/domain/activity/WorkloadActivityCard.svelte';
	import CostOverviewChart from '$lib/domain/cost/CostOverviewChart.svelte';
	import CriticalIssuesCard from '$lib/domain/issues/CriticalIssuesCard.svelte';
	import Persistence from '$lib/domain/persistence/Persistence.svelte';
	import Configs from '$lib/domain/resources/Configs.svelte';
	import Manifest from '$lib/domain/resources/Manifest.svelte';
	import Secrets from '$lib/domain/resources/Secrets.svelte';
	import JobResources from '$lib/domain/workload/JobResources.svelte';
	import WorkloadDeploy from '$lib/domain/workload/WorkloadDeploy.svelte';
	import WorkloadHealth from '$lib/domain/workload/WorkloadHealth.svelte';
	import Confirm from '$lib/ui/Confirm.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import HeaderActions from '$lib/ui/HeaderActions.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { generateJobRunName } from '$lib/utils/jobRunName';
	import { Alert, BodyShort, Button, Heading, Loader, Modal } from '@nais/ds-svelte-community';
	import { ActionMenu, ActionMenuItem } from '@nais/ds-svelte-community/experimental';
	import {
		FileTextIcon,
		MenuElipsisVerticalIcon,
		PlayIcon,
		TrashIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import Runs from './Runs.svelte';
	import Schedule from './Schedule.svelte';
	import TriggerRunModal from './TriggerRunModal.svelte';

	let { data }: PageProps = $props();
	let { Job, teamSlug, viewerIsMember } = $derived(data);

	let jobData = $derived(Job ? $Job.data : undefined);
	let jobErrors = $derived(Job ? $Job.errors : undefined);
	let jobFetching = $derived(Job ? $Job.fetching : false);
	let job = $derived(jobData?.team?.environment?.job ?? null);

	const triggerRunMutation = () =>
		graphql(`
			mutation TriggerJob(
				$teamSlug: Slug!
				$environment: String!
				$jobName: String!
				$runName: String!
				$jobId: ID!
			) {
				triggerJob(
					input: {
						environmentName: $environment
						teamSlug: $teamSlug
						runName: $runName
						name: $jobName
					}
				) {
					jobRun {
						...All_Runs_insert @parentID(value: $jobId) @prepend
					}
				}
			}
		`);

	const deleteJobRunMutation = graphql(`
		mutation DeleteJobRun($teamSlug: Slug!, $environment: String!, $runName: String!) {
			deleteJobRun(
				input: { teamSlug: $teamSlug, environmentName: $environment, runName: $runName }
			) {
				success
			}
		}
	`);

	let triggerRun = $state(triggerRunMutation());

	let jobName = $derived(page.params.job);
	let environment = $derived(page.params.env);

	let open = $state(false);

	const submit = (runName: string) => {
		if (!jobName || !environment) {
			console.error('Job name or environment is not defined');
			return;
		}
		triggerRun.mutate({
			jobName: jobName,
			environment,
			teamSlug,
			runName,
			jobId: job!.id
		});
	};

	let criticalEdges = $derived(
		job?.issues.edges.filter((e) => e.node.severity === 'CRITICAL') ?? []
	);
	let totalRuns = $derived(job?.recentRuns.nodes.length ?? 0);
	let succeededRuns = $derived(
		job?.recentRuns.nodes.filter((n) => n.status.state === 'SUCCEEDED').length ?? 0
	);

	let deleteConfirmOpen = $state(false);
	let deleteRunName = $state('');
	let showManifest = $state(false);

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
		// Small delay to allow the watcher cache to process the delete event
		setTimeout(() => Job.fetch({ policy: 'NetworkOnly' }), 500);
	};
</script>

<GraphErrors errors={jobErrors} />

{#if jobFetching}
	<div style="display: flex; justify-content: center; align-items: center; height: 500px;">
		<Loader size="3xlarge" />
	</div>
{/if}

{#if job}
	<div class="wrapper">
		<div class="job-content">
			{#if viewerIsMember}
				<HeaderActions>
					<ActionMenu>
						{#snippet trigger(props)}
							<Button
								variant="secondary"
								size="small"
								icon={MenuElipsisVerticalIcon}
								iconPosition="right"
								{...props}
							>
								Actions
							</Button>
						{/snippet}
						<button
							class="action-menu-button"
							disabled={job?.deletionStartedAt !== null}
							onclick={(e: MouseEvent) => {
								if (e.metaKey || e.ctrlKey) {
									if (jobName && environment) {
										submit(generateJobRunName(jobName));
									}
								} else {
									open = true;
								}
							}}
						>
							<ActionMenuItem icon={PlayIcon}>Trigger run</ActionMenuItem>
						</button>
						<button class="action-menu-button" onclick={() => (showManifest = true)}>
							<ActionMenuItem icon={FileTextIcon}>View manifest</ActionMenuItem>
						</button>
						<a
							class="action-menu-button"
							href="/team/{page.params.team}/{page.params.env}/job/{page.params.job}/delete"
						>
							<ActionMenuItem icon={TrashIcon} variant="danger">Delete job</ActionMenuItem>
						</a>
					</ActionMenu>
				</HeaderActions>
			{/if}

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
				<SurfaceCard title="Runs">
					<Schedule
						schedule={job?.schedule}
						scheduleContext={{
							team: job?.team.slug ?? '',
							environment: job?.teamEnvironment.environment.name ?? '',
							job: job?.name ?? ''
						}}
					/>
					<Runs {job} ondelete={viewerIsMember ? handleDeleteRun : undefined} />
				</SurfaceCard>
				{#if jobName && environment}
					<CostOverviewChart workload={jobName} {environment} {teamSlug} />
				{/if}
			</div>
			<div class="sidebar">
				<WorkloadDeploy workload={job} />
				<JobResources requests={job?.resources.requests} limits={job?.resources.limits} />
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

		{#if open && jobName && environment}
			<TriggerRunModal {jobName} {environment} close={() => (open = false)} {submit} />
		{/if}

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
		<Modal bind:open={showManifest} closeButton width="medium">
			{#snippet header()}
				<Heading as="h2" size="small">Manifest &ndash; {jobName}</Heading>
			{/snippet}
			<Manifest workload={job} />
		</Modal>
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

	.action-menu-button {
		all: unset;
		display: contents;
		cursor: pointer;
	}

	.sidebar {
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
