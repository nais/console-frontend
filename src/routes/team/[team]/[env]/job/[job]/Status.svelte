<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue, fragment, graphql, type JobStatus } from '$houdini';
	import Nais from '$lib/icons/Nais.svelte';
	import { Skeleton } from '@nais/ds-svelte-community';
	import {
		ExclamationmarkTriangleFillIcon,
		QuestionmarkDiamondFillIcon
	} from '@nais/ds-svelte-community/icons';

	$: teamName = $page.params.team;
	$: envName = $page.params.env;
	$: jobName = $page.params.job;

	export let job: JobStatus;
	$: data = fragment(
		job,
		graphql(`
			fragment JobStatus on NaisJob {
				jobState @loading {
					state @loading
					errors {
						__typename
					}
				}
			}
		`)
	);
	$: state = $data.jobState?.state;
</script>

<div class="card {state.toString()}">
	{#if $data.jobState.state == PendingValue}
		<h4>Status</h4>
		<Skeleton variant="text" />
	{:else if $data.jobState.state === 'NAIS'}
		<h4>Status {$data.jobState.state}</h4>
		<div class="iconWrapper">
			<Nais
				size="5rem"
				style="color: var(--a-icon-success)"
				aria-label="Job is nais"
				role="image"
			/>
		</div>
	{:else if $data.jobState.state === 'FAILING'}
		<h4>Status <ExclamationmarkTriangleFillIcon style="color: var(--a-icon-danger)" /></h4>
		<div>
			Job is failing.<br />
			<a class="status" href="/team/{teamName}/{envName}/job/{jobName}/status">
				{$data.jobState.errors.length}
				{$data.jobState.errors.length > 1 ? 'issues' : 'issue'}
			</a> detected.
		</div>
	{:else if $data.jobState.state === 'NOTNAIS'}
		<h4>Status <ExclamationmarkTriangleFillIcon style="color: var(--a-icon-warning)" /></h4>
		<div>
			Job is not nais.<br />
			<a class="status" href="/team/{teamName}/{envName}/job/{jobName}/status">
				{$data.jobState.errors.length}
				{$data.jobState.errors.length > 1 ? 'issues' : 'issue'}
			</a>
			detected.
		</div>
	{:else if $data.jobState.state === 'UNKNOWN'}
		<h4>Status <QuestionmarkDiamondFillIcon /></h4>
		<div>Job status is unknown.</div>
	{/if}
</div>

<style>
	h4 {
		margin-bottom: 8px;
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}
	.iconWrapper {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		vertical-align: middle;
		padding-top: 1rem;
	}

	.card {
		border-radius: 0.5rem;
		padding: 1rem;
		grid-column: span 2;
	}

	.NAIS {
		background-color: var(--a-bg-default);
	}

	.NOTNAIS {
		background-color: var(--a-surface-warning-moderate);
		color: var(--a-text-on-warning);
		border: 2px solid var(--a-border-warning);
	}

	.FAILING {
		background-color: var(--a-surface-danger-subtle);
		border: 2px solid var(--a-border-danger);
	}
</style>
