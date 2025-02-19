<script lang="ts">
	import { fragment, graphql, WorkloadState, type AppStatus } from '$houdini';
	import { BodyShort, Heading, Link } from '@nais/ds-svelte-community';
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
	<div class="wrapper">
		<Heading level="3" size="small">Status</Heading>
		<BodyShort>
			{#if state === WorkloadState.NAIS}
				<CheckmarkCircleFillIcon class="text-aligned-icon" style="color: var(--a-icon-success)" /> Application
				is nais.
			{:else if state === WorkloadState.NOT_NAIS}
				<ExclamationmarkTriangleFillIcon
					class="text-aligned-icon"
					style="color: var(--a-icon-warning)"
				/> Application is not nais.
			{:else if state === WorkloadState.FAILING}
				<XMarkOctagonFillIcon class="text-aligned-icon" style="color: var(--a-icon-danger)" /> Application
				is failing.
			{:else if state === WorkloadState.UNKNOWN}
				<QuestionmarkDiamondFillIcon
					class="text-aligned-icon"
					style="color: var(--a-icon-action)"
				/> Application status unknown.
			{/if}
		</BodyShort>
		{#if nErrors > 0}
			<Link href="/team/{$data.team.slug}/{$data.environment.name}/app/{$data.name}/status">
				View {nErrors} issue{nErrors > 1 ? 's' : ''}
			</Link>
		{/if}
	</div>
{/if}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-1);
		align-items: start;
	}
</style>
