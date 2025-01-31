<script lang="ts">
	import { fragment, graphql, WorkloadState, type JobStatus } from '$houdini';
	import Nais from '$lib/icons/Nais.svelte';
	import {
		CheckmarkCircleFillIcon,
		ExclamationmarkTriangleFillIcon,
		QuestionmarkDiamondFillIcon,
		XMarkOctagonFillIcon
	} from '@nais/ds-svelte-community/icons';

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

{#if $data.status}
	{@const state = $data.status.state}
	{@const nErrors = $data.status.errors.length}
	<div style="display: flex; gap: var(--a-spacing-1);">
		{#if state === WorkloadState.NAIS}
			<CheckmarkCircleFillIcon style="color: var(--a-icon-success); font-size: 1.25rem" />
			Job is nais.
		{:else if state === WorkloadState.NOT_NAIS}
			<ExclamationmarkTriangleFillIcon style="color: var(--a-icon-warning); font-size: 1.25rem" />
			Job is not nais.
		{:else if state === WorkloadState.FAILING}
			<XMarkOctagonFillIcon style="color: var(--a-icon-danger); font-size: 1.25rem" />
			Job is failing.
		{:else if state === WorkloadState.UNKNOWN}
			<QuestionmarkDiamondFillIcon style="color: var(--a-icon-action); font-size: 1.25rem" />
			Job status unknown.
		{/if}
	</div>
	{#if nErrors > 0}
		<a href="/team/{$data.team.slug}/{$data.environment.name}/job/{$data.name}/status">
			{nErrors}
			{`${state === WorkloadState.NAIS ? 'todo' : 'issue'}${nErrors > 1 ? 's' : ''}`}
		</a>
	{/if}
{/if}
