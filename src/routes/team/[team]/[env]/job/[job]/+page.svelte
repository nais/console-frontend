<script lang="ts">
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import SidebarActivity from '$lib/domain/activity/sidebar/SidebarActivity.svelte';
	import AggregatedCostForWorkload from '$lib/domain/cost/AggregatedCostForWorkload.svelte';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import List from '$lib/ui/List.svelte';
	import NetworkPolicy from '$lib/domain/resources/NetworkPolicy.svelte';
	import Persistence from '$lib/domain/persistence/Persistence.svelte';
	import Secrets from '$lib/domain/resources/Secrets.svelte';
	import WorkloadVulnerabilitySummary from '$lib/domain/vulnerability/WorkloadVulnerabilitySummary.svelte';
	import WorkloadDeploy from '$lib/domain/workload/WorkloadDeploy.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { Alert, Button, Heading, Loader } from '@nais/ds-svelte-community';
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
				<div style="display:flex; flex-direction: column; gap:0.5rem;">
					<div class="runs-header">
						<Heading as="h2" size="medium">Runs</Heading>
						{#if viewerIsMember}
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
				<Schedule schedule={job.schedule} />
				{#if jobName && environment}
					<AggregatedCostForWorkload workload={jobName} {environment} {teamSlug} />
				{/if}
				<div>
					<Heading as="h2" size="small">Vulnerabilities</Heading>
					<WorkloadVulnerabilitySummary workload={job} />
				</div>

				<SidebarActivity activityLog={job} />

				{#if jobName && environment}
					<Secrets workload={jobName} {environment} {teamSlug} />
				{/if}
			</div>
		</div>

		{#if open && jobName && environment}
			<TriggerRunModal {jobName} {environment} close={() => (open = false)} {submit} />
		{/if}
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
