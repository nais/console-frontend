<script lang="ts">
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import AggregatedCostForWorkload from '$lib/components/AggregatedCostForWorkload.svelte';
	import Image from '$lib/components/Image.svelte';
	import Persistence from '$lib/components/Persistence.svelte';
	import Traffic from '$lib/components/Traffic.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Button, Heading } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import Runs from './Runs.svelte';
	import Schedule from './Schedule.svelte';
	import Secrets from './Secrets.svelte';
	import Status from './Status.svelte';
	import TriggerRunModal from './TriggerRunModal.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { Job, teamSlug } = $derived(data);

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
</script>

<GraphErrors errors={$Job.errors} />

{#if $Job.data}
	{@const job = $Job.data.team.environment.job}
	<div class="job-content">
		<div style="display:flex; flex-direction: column; gap: 1rem;">
			<div style="display:flex; flex-direction: column; gap:0.5rem;">
				<div class="runs-header">
					<Heading level="2" size="medium">Runs</Heading>
					{#if $Job.data.team.viewerIsMember || $Job.data.team.viewerIsOwner}
						<Button variant="secondary" size="small" onclick={() => (open = true)}>
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
				<Heading level="2" size="medium">Traffic policies</Heading>
				<Traffic workload={job} />
			</div>
			<div>
				<Heading level="2" size="medium">Persistence</Heading>
				<Persistence workload={job} />
			</div>
		</div>
		<div>
			<h4>Status</h4>
			<Status {job} />
			<hr />
			<h4>Run configuration</h4>
			<Schedule schedule={job.schedule} />
			<hr />
			<Image workload={job} />
			<hr />
			<AggregatedCostForWorkload workload={jobName} {environment} {teamSlug} />
			{#if $Job.data.team.viewerIsMember || $Job.data.team.viewerIsOwner}
				<hr />
				<h4>Secrets</h4>
				<Secrets />
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
		grid-template-columns: 1fr 239px;
		gap: 1rem;
	}

	.runs-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	h4 {
		font-weight: 400;
		margin-bottom: 0.5rem;
	}

	hr {
		border: 0;
		border-top: 1px solid var(--a-border-default);
		margin: 1.5rem 0.125rem;
	}
</style>
