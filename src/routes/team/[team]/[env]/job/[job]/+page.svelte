<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import SidebarActivity from '$lib/domain/activity/sidebar/SidebarActivity.svelte';
	import AggregatedCostForWorkload from '$lib/domain/cost/AggregatedCostForWorkload.svelte';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import Persistence from '$lib/domain/persistence/Persistence.svelte';
	import Configs from '$lib/domain/resources/Configs.svelte';
	import NetworkPolicy from '$lib/domain/resources/NetworkPolicy.svelte';
	import Secrets from '$lib/domain/resources/Secrets.svelte';
	import WorkloadVulnerabilitySummary from '$lib/domain/vulnerability/WorkloadVulnerabilitySummary.svelte';
	import WorkloadDeploy from '$lib/domain/workload/WorkloadDeploy.svelte';
	import Confirm from '$lib/ui/Confirm.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { getContextClient } from '$lib/urql/context';
	import { generateJobRunName } from '$lib/utils/jobRunName';
	import { Alert, BodyShort, Button, Heading, Loader } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';
	import { DeleteJobRunMutation, TriggerJobMutation } from './job';
	import Runs from './Runs.svelte';
	import Schedule from './Schedule.svelte';
	import TriggerRunModal from './TriggerRunModal.svelte';

	let { data }: PageProps = $props();
	let { Job, teamSlug, viewerIsMember } = $derived(data);

	const client = getContextClient();

	let jobName = $derived(page.params.job);
	let environment = $derived(page.params.env);

	let open = $state(false);

	let deleteErrors = $state<{ message: string }[] | null>(null);

	const submit = async (runName: string) => {
		if (!jobName || !environment) {
			console.error('Job name or environment is not defined');
			return;
		}
		await client
			.mutation(TriggerJobMutation, {
				jobName,
				environment,
				teamSlug,
				runName
			})
			.toPromise();
		void invalidateAll();
	};

	let deleteConfirmOpen = $state(false);
	let deleteRunName = $state('');

	const handleDeleteRun = (runName: string) => {
		deleteRunName = runName;
		deleteConfirmOpen = true;
	};

	const confirmDeleteRun = async () => {
		if (!jobName || !environment) return;

		const result = await client
			.mutation(DeleteJobRunMutation, {
				teamSlug,
				environment,
				runName: deleteRunName
			})
			.toPromise();

		if (result.error) {
			deleteErrors = result.error.graphQLErrors?.map((e) => ({ message: e.message })) ?? [
				{ message: result.error.message }
			];
			return;
		}
		if (!result.data?.deleteJobRun.success) return;

		deleteErrors = null;
		deleteRunName = '';
		// Small delay to allow the backend to process the delete event
		setTimeout(() => void invalidateAll(), 500);
	};
</script>

{#if Job.data}
	{@const job = Job.data.team.environment.job}
	<div class="workload-deploy-wrapper">
		<WorkloadDeploy workload={job} />
	</div>
{/if}

<GraphErrors errors={Job.errors} />

{#if !Job.data && !Job.errors}
	<div style="display: flex; justify-content: center; align-items: center; height: 500px;">
		<Loader size="3xlarge" />
	</div>
{/if}

{#if Job.data}
	{@const job = Job.data.team.environment.job}
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
				{#if job.issues.edges.length > 0}
					<div>
						<Heading as="h3" spacing>Issues</Heading>
						<List>
							{#each job.issues.edges as edge (edge.node.id)}
								<IssueListItem item={edge.node} />
							{/each}
						</List>
					</div>
				{/if}
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
				<Schedule
					schedule={job.schedule}
					scheduleContext={{
						team: job.team.slug,
						environment: job.teamEnvironment.environment.name,
						job: job.name
					}}
				/>
				{#if jobName && environment}
					<AggregatedCostForWorkload workload={jobName} {environment} {teamSlug} />
				{/if}
				<div>
					<Heading as="h2" size="small">Vulnerabilities</Heading>
					<WorkloadVulnerabilitySummary workload={job} />
				</div>
				{#if jobName && environment}
					<Configs workload={jobName} {environment} {teamSlug} />
					<Secrets workload={jobName} {environment} {teamSlug} />
				{/if}
				<SidebarActivity activityLog={job} />
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
			<GraphErrors errors={deleteErrors} />
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
</style>
