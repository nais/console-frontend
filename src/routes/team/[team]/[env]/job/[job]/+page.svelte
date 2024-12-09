<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import AggregatedCostForWorkload from '$lib/components/AggregatedCostForWorkload.svelte';
	import Image from '$lib/components/Image.svelte';
	import Persistence from '$lib/components/Persistence.svelte';
	import Traffic from '$lib/components/Traffic.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Button, Modal, TextField } from '@nais/ds-svelte-community';
	import { TimerStartIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import Authentications from './Authentications.svelte';
	import Runs from './Runs.svelte';
	import Schedule from './Schedule.svelte';
	import Secrets from './Secrets.svelte';
	import Status from './Status.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { Job } = $derived(data);

	const triggerRunMutation = () =>
		graphql(`
			mutation TriggerJob(
				$team: Slug!
				$environment: String!
				$jobName: String!
				$runName: String!
				$jobId: ID!
			) {
				triggerJob(
					input: {
						environmentName: $environment
						teamSlug: $team
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

	onNavigate(() => {
		triggerRun = triggerRunMutation();
	});

	let jobName = $derived($page.params.job);
	let environment = $derived($page.params.env);
	let team = $derived($page.params.team);

	let open = $state(false);
	let runName = $state('');
	let errors: string[] = $state([]);

	const submit = () => {
		triggerRun.mutate({
			jobName,
			environment,
			team,
			runName,
			jobId: $Job.data!.team.environment.job.id
		});
	};

	const cancel = () => {
		runName = '';
		errors = [];
		open = false;
	};

	const confirm = () => {
		let valid = validateJobName(runName);
		console.log(valid);
		if (!valid.isValid) {
			open = true;
			errors = valid.errors;
			return;
		} else if (runName !== '') {
			open = false;
			submit();
		} else {
			open = true;
			errors = ['The run name cannot be empty.'];
		}
	};

	type ValidationResult = {
		isValid: boolean;
		errors: string[];
	};

	function validateJobName(input: string): ValidationResult {
		const errors: string[] = [];

		// Kubernetes resource name regex and length constraint
		const k8sNameRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
		const maxNameLength = 63;

		// Validate jobName
		if (!input) {
			errors.push('Run name is required.');
		} else {
			if (!k8sNameRegex.test(input)) {
				errors.push(
					'Run name must be a valid Kubernetes resource name (lowercase alphanumeric and hyphens).'
				);
			}
			if (input.length > maxNameLength) {
				errors.push(
					`Run name must not exceed ${maxNameLength} characters. Current length: ${input.length}.`
				);
			}
		}

		return {
			isValid: errors.length === 0,
			errors
		};
	}
</script>

<GraphErrors errors={$Job.errors} />

{#if $Job.data}
	{@const job = $Job.data.team.environment.job}
	<div class="grid">
		<Status {job} />

		<Card columns={3}>
			<Image workload={job} />
		</Card>

		<Card columns={3} rows={1}>
			<AggregatedCostForWorkload workload={jobName} {environment} {team} />
		</Card>

		<Card columns={3}>
			<h4>Schedule</h4>
			<Schedule schedule={job.schedule} />
		</Card>
		<Card columns={12}>
			<div class="heading">
				<h4>Runs</h4>
				{#if $Job.data.team.viewerIsMember || $Job.data.team.viewerIsOwner}
					<Button
						variant="secondary"
						size="small"
						onclick={() => {
							open = true;
						}}
						iconLeft={TimerStartIcon}
					>
						Trigger run
					</Button>
				{/if}
			</div>
			<Runs {job} />
		</Card>
		<Card columns={12}>
			<h4>Traffic policies</h4>
			<Traffic workload={job} />
		</Card>

		<Card columns={4}>
			<h4>Persistence</h4>
			<Persistence workload={job} />
		</Card>
		<Card columns={4}>
			<h4>Authentications</h4>
			<Authentications {job} />
		</Card>
		{#if $Job.data.team.viewerIsMember || $Job.data.team.viewerIsOwner}
			<Card columns={4}>
				<h4>Secrets</h4>
				<Secrets />
			</Card>
		{/if}
	</div>
	<Modal bind:open onClose={close}>
		{#snippet header()}
			<h3>Trigger run of {jobName}</h3>
		{/snippet}
		<div class="wrapper">
			This will trigger a new run of
			<strong>{jobName}</strong> in
			<strong>{environment}</strong>.
			<br />
			Please provide a name for the run.
			<br />
			<br />
			<TextField type="text" bind:value={runName}>
				{#snippet label()}
					Run name:
				{/snippet}
			</TextField>

			{#if $triggerRun.errors?.length ?? 0 > 0}
				<GraphErrors errors={$triggerRun.errors} />
			{/if}
			{#if errors.length > 0}
				<div class="errors">
					{#each errors as error}
						<span>{error}</span><br />
					{/each}
				</div>
			{/if}
		</div>

		{#snippet footer()}
			<Button variant="primary" type="submit" onclick={confirm}>Confirm</Button>
			<Button variant="tertiary" type="reset" onclick={cancel}>Cancel</Button>
		{/snippet}
	</Modal>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	h4 {
		font-weight: 400;
		margin-bottom: 0.5rem;
	}
	.heading {
		display: flex;
		justify-content: space-between;
	}
	.wrapper {
		width: 500px;
	}
	.errors {
		margin-top: 1rem;
		color: var(--a-text-danger);
	}
</style>
