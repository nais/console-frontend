<script lang="ts">
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import SidebarActivity from '$lib/domain/activity/sidebar/SidebarActivity.svelte';
	import AggregatedCostForWorkload from '$lib/domain/cost/AggregatedCostForWorkload.svelte';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import Persistence from '$lib/domain/persistence/Persistence.svelte';
	import Configs from '$lib/domain/resources/Configs.svelte';
	import NetworkPolicy from '$lib/domain/resources/NetworkPolicy.svelte';
	import Secrets from '$lib/domain/resources/Secrets.svelte';
	import WorkloadDeploy from '$lib/domain/workload/WorkloadDeploy.svelte';
	import Confirm from '$lib/ui/Confirm.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { generateJobRunName } from '$lib/utils/jobRunName';
	import { Alert, BodyShort, Button, Heading, Loader } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';
	import Runs from './Runs.svelte';
	import Schedule from './Schedule.svelte';
	import TriggerRunModal from './TriggerRunModal.svelte';

	let { data }: PageProps = $props();
	let { Job, teamSlug, viewerIsMember } = $derived(data);

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
			jobId: $Job.data!.team.environment.job.id
		});
	};

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
		// Small delay to allow the watcher cache to process the delete event
		setTimeout(() => Job.fetch({ policy: 'NetworkOnly' }), 500);
	};
</script>

{#if $Job.data}
	{@const job = $Job.data.team.environment.job}
	<div class="workload-deploy-wrapper">
		<WorkloadDeploy workload={job} />
	</div>
{/if}

<GraphErrors errors={$Job.errors} />

{#if $Job.fetching}
	<div style="display: flex; justify-content: center; align-items: center; height: 500px;">
		<Loader size="3xlarge" />
	</div>
{/if}

{#if $Job.data}
	{@const job = $Job.data.team.environment.job}
	<div class="wrapper">
		<div class="job-content">
			<div class="main-section">
				{#if job.deletionStartedAt}
					<Alert variant="info" size="small" fullWidth={false}>
						This job is being deleted. Deletion started <Time
							time={job.deletionStartedAt}
							distance
						/>. If the deletion is taking too long, contact the Nais team.
					</Alert>
				{/if}
				{#if $Job.data.team.environment.job.issues.edges.length > 0}
					<div>
						<Heading as="h3" spacing>Issues</Heading>
						<List>
							{#each $Job.data.team.environment.job.issues.edges as edge (edge.node.id)}
								<IssueListItem item={edge.node} />
							{/each}
						</List>
					</div>
				{/if}
				<Schedule
					schedule={job.schedule}
					scheduleContext={{
						team: job.team.slug,
						environment: job.teamEnvironment.environment.name,
						job: job.name
					}}
				/>
				<div style="display:flex; flex-direction: column; gap:0.5rem;">
					<div class="runs-header">
						<Heading as="h2" size="medium">Runs</Heading>
						{#if viewerIsMember}
							<Button
								variant="secondary"
								size="small"
								onclick={(e: MouseEvent) => {
									if (e.metaKey || e.ctrlKey) {
										if (jobName && environment) {
											submit(generateJobRunName(jobName));
										}
									} else {
										open = true;
									}
								}}
								disabled={job.deletionStartedAt !== null}
								title="Click to configure run name, or Cmd/Ctrl+Click to trigger immediately"
							>
								Trigger run
							</Button>
						{/if}
					</div>
					<Runs {job} ondelete={viewerIsMember ? handleDeleteRun : undefined} />
				</div>
				<div>
					<NetworkPolicy workload={job} />
				</div>
				<div>
					<Persistence workload={job} />
				</div>
			</div>
			<div class="sidebar">
				{#if jobName && environment}
					<AggregatedCostForWorkload workload={jobName} {environment} {teamSlug} />
				{/if}
				{#if jobName && environment}
					<Configs workload={jobName} {environment} {teamSlug} />
					<Secrets workload={jobName} {environment} {teamSlug} />
				{/if}
				<SidebarActivity activityLog={job} direct={job.activityLog} />
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
		gap: 1rem;
	}

	.runs-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.workload-deploy-wrapper {
		margin-top: -2rem;
		padding-bottom: var(--spacing-layout);
	}

	/* Mobile responsive layout */
	@media (max-width: 767px), (max-height: 500px) {
		.job-content {
			grid-template-columns: 1fr;
			gap: var(--spacing-layout);
		}

		.runs-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--ax-space-12);
		}

		.runs-header :global(button) {
			width: 100%;
		}
	}
</style>
