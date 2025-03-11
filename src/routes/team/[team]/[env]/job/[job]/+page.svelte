<script lang="ts">
	import { page } from '$app/state';
	import { graphql, type WorkloadStatusErrorLevel$options } from '$houdini';
	import AggregatedCostForWorkload from '$lib/components/AggregatedCostForWorkload.svelte';
	import Image from '$lib/components/Image.svelte';
	import NetworkPolicy from '$lib/components/NetworkPolicy.svelte';
	import Persistence from '$lib/components/persistence/Persistence.svelte';
	import Secrets from '$lib/components/Secrets.svelte';
	import WorkloadDeploy from '$lib/components/WorkloadDeploy.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, BodyLong, BodyShort, Button, Heading } from '@nais/ds-svelte-community';
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

	const levelVariant = (level?: WorkloadStatusErrorLevel$options) => {
		switch (level) {
			case 'ERROR':
				return 'error';
			case 'WARNING':
				return 'warning';
			case 'TODO':
			default:
				return 'info';
		}
	};
</script>

<GraphErrors errors={$Job.errors} />

{#if $Job.data}
	{@const job = $Job.data.team.environment.job}
	<div class="job-content">
		<div style="display:flex; flex-direction: column; gap: 1rem;">
			{#if job.status.errors.some((error) => error.__typename === 'WorkloadStatusSynchronizationFailing')}
				<Alert
					variant={levelVariant(
						job.status.errors.find(
							(error) => error.__typename === 'WorkloadStatusSynchronizationFailing'
						)?.level
					)}
				>
					<Heading level="2" size="small" spacing>Synchronization failing</Heading>
					<BodyLong spacing>
						The rollout of the job is failing, meaning it is not in sync with the latest deployment.
						This may be due to a misconfiguration or a temporary issue, so try again in a few
						minutes. If the problem persists, please contact the Nais team.
					</BodyLong>

					<Heading level="3" size="xsmall" spacing>Error details</Heading>

					<code style="font-size: 0.8rem; line-height: 1;"
						>{job.status.errors.find(
							(error) => error.__typename === 'WorkloadStatusSynchronizationFailing'
						)?.detail}</code
					>
				</Alert>
			{/if}
			{#if job.status.errors.some((error) => error.__typename === 'WorkloadStatusDeprecatedRegistry')}
				<Alert variant="error">
					<BodyShort spacing
						>This job is using a deprecated image registry ({job.status.errors.find(
							(error) => error.__typename === 'WorkloadStatusDeprecatedRegistry'
						)?.registry}).</BodyShort
					>

					<BodyLong
						>Starting April 1st, applications and jobs on Nais must use images from Google Artifact
						Registry (GAR). The easiest way to ensure that images are stored in GAR is to use Nais'
						GitHub Actions in the workflow. <a
							href="https://nais.io/log/#2025-02-24-image-policy"
							target="_blank"
							rel="noopener noreferrer">Read more in Nais announcement</a
						>.
					</BodyLong>
				</Alert>
			{/if}

			{#if job.deletionStartedAt}
				<Alert variant="info" size="small" fullWidth={false}>
					This job is being deleted. Deletion started <Time
						time={job.deletionStartedAt}
						distance
					/>. If the deletion is taking too long, please contact the Nais team.
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
