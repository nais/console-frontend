<script lang="ts">
	import { fragment, graphql, WorkloadState, type JobStatus } from '$houdini';
	import ErrorIcon from '$lib/icons/ErrorIcon.svelte';
	import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { Detail, Heading } from '@nais/ds-svelte-community';
	import { QuestionmarkDiamondFillIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		job: JobStatus;
	}

	let { job }: Props = $props();
	let data = $derived(
		fragment(
			job,
			graphql(`
				fragment JobStatus on Job {
					team {
						slug
					}
					environment {
						name
					}

					name
					status {
						state
						errors {
							__typename
						}
					}
				}
			`)
		)
	);
</script>

<div class="wrapper">
	{#if $data.status}
		{@const state = $data.status.state}
		{@const nErrors = $data.status.errors.length}
		<Heading level="3" size="small">Status</Heading>
		{#if nErrors > 0}
			<Detail>{nErrors} issue{nErrors > 1 ? 's' : ''}</Detail>
		{/if}
		<div style="display: flex; gap: var(--a-spacing-1); margin-top: var(--a-spacing-3);">
			{#if state === WorkloadState.NAIS}
				<SuccessIcon class="text-aligned-icon" /> Job is nais.
			{:else if state === WorkloadState.NOT_NAIS}
				<WarningIcon class="text-aligned-icon" /> Job is not nais.
			{:else if state === WorkloadState.FAILING}
				<ErrorIcon class="text-aligned-icon" /> Job is failing.
			{:else if state === WorkloadState.UNKNOWN}
				<QuestionmarkDiamondFillIcon style="color: var(--a-icon-action); font-size: 1.25rem" />
				Job status unknown.
			{/if}
		</div>

		{#if nErrors > 0}
			<div style="margin-top: var(--a-spacing-2)">
				<a href="/team/{$data.team.slug}/{$data.environment.name}/job/{$data.name}/status">
					View details
				</a>
			</div>
		{/if}
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-1);
		align-items: start;
	}
</style>
