<script lang="ts">
	import { fragment, graphql, WorkloadState, type AppStatus } from '$houdini';
	import { Detail, Heading } from '@nais/ds-svelte-community';
	import {
		CheckmarkCircleFillIcon,
		ExclamationmarkTriangleFillIcon,
		QuestionmarkDiamondFillIcon,
		XMarkOctagonFillIcon
	} from '@nais/ds-svelte-community/icons';

	interface Props {
		app: AppStatus;
	}

	let { app }: Props = $props();
	let data = $derived(
		fragment(
			app,
			graphql(`
				fragment AppStatus on Application {
					name
					team {
						slug
					}
					environment {
						name
					}
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
	<Heading level="3" size="small">Status</Heading>
	{#if nErrors > 0}
		<Detail>{nErrors} issue{nErrors > 1 ? 's' : ''}</Detail>
	{/if}
	<div style="display: flex; gap: var(--a-spacing-1); margin-top: var(--a-spacing-3)">
		{#if state === WorkloadState.NAIS}
			<CheckmarkCircleFillIcon style="color: var(--a-icon-success); font-size: 1.25rem" />
			Application is nais.
		{:else if state === WorkloadState.NOT_NAIS}
			<ExclamationmarkTriangleFillIcon style="color: var(--a-icon-warning); font-size: 1.25rem" />
			Application is not nais.
		{:else if state === WorkloadState.FAILING}
			<XMarkOctagonFillIcon style="color: var(--a-icon-danger); font-size: 1.25rem" />
			Application is failing.
		{:else if state === WorkloadState.UNKNOWN}
			<QuestionmarkDiamondFillIcon style="color: var(--a-icon-action); font-size: 1.25rem" />
			Application status unknown.
		{/if}
	</div>
	{#if nErrors > 0}
		<div style="margin-top: var(--a-spacing-2)">
			<a href="/team/{$data.team.slug}/{$data.environment.name}/app/{$data.name}/status">
				View details
			</a>
		</div>
	{/if}
{/if}
