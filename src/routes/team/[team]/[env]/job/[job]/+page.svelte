<script lang="ts">
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import AggregatedCostForWorkload from '$lib/components/AggregatedCostForWorkload.svelte';
	import ErrorMessage from '$lib/components/errors/ErrorMessage.svelte';
	import Image from '$lib/components/Image.svelte';
	import NetworkPolicy from '$lib/components/NetworkPolicy.svelte';
	import Persistence from '$lib/components/persistence/Persistence.svelte';
	import Secrets from '$lib/components/Secrets.svelte';
	import WorkloadDeploy from '$lib/components/WorkloadDeploy.svelte';
	import { docURL } from '$lib/doc';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, Button, Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';
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

	let triggerRun = $state(triggerRunMutation());

	let jobName = $derived(page.params.job);
	let environment = $derived(page.params.env);

	let open = $state(false);

	const submit = (runName: string) => {
		triggerRun.mutate({
			jobName,
			environment,
			teamSlug,
			runName,
			jobId: $Job.data!.team.environment.job.id
		});
	};

	const supportedErrorTypes = [
		'WorkloadStatusInvalidNaisYaml',
		'WorkloadStatusSynchronizationFailing',
		'WorkloadStatusDeprecatedRegistry',
		'WorkloadStatusFailedRun'
	];
</script>

<GraphErrors errors={$Job.errors} />

{#if $Job.data}
	{@const job = $Job.data.team.environment.job}
	<div class="job-content">
		<div style="display:flex; flex-direction: column; gap: 1rem;">
			{#each job.status.errors as error, i (i)}
				{#if supportedErrorTypes.includes(error.__typename)}
					<ErrorMessage {error} {docURL} workloadType="Job" />
				{/if}
			{/each}

			{#if job.deletionStartedAt}
				<Alert variant="info" size="small" fullWidth={false}>
					This job is being deleted. Deletion started <Time
						time={job.deletionStartedAt}
						distance
					/>. If the deletion is taking too long, contact the Nais team.
				</Alert>
			{/if}

			<div style="display:flex; flex-direction: column; gap:0.5rem;">
				<div class="runs-header">
					<Heading level="2" size="medium">Runs</Heading>
					{#if viewerIsMember && job.schedule}
						<Button
							variant="secondary"
							size="small"
							onclick={() => (open = true)}
							disabled={job.deletionStartedAt !== null}
						>
							Trigger run
						</Button>
					{/if}
				</div>
				<!-- <p>
					Showing current run and the last 2 successful and 1 failed runs, as configured by
					successfulJobsHistoryLimit and failedJobsHistoryLimit (default: 3).
				</p> -->
				<Runs {job} />
			</div>
			<div>
				<NetworkPolicy workload={job} />
			</div>
			<div>
				<Persistence workload={job} />
			</div>
		</div>
		<div class="sidebar">
			<!-- <Status {job} /> -->
			<Schedule schedule={job.schedule} />
			<AggregatedCostForWorkload workload={jobName} {environment} {teamSlug} />
			<Image workload={job} />
			<WorkloadDeploy workload={job} />

			{#if viewerIsMember}
				<Secrets workload={jobName} {environment} {teamSlug} />
			{/if}
		</div>
	</div>

	{#if open}
		<TriggerRunModal {jobName} {environment} close={() => (open = false)} {submit} />
	{/if}
{/if}

<style>
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
</style>
