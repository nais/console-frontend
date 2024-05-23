<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue, fragment, graphql, type AppStatus } from '$houdini';
	import Nais from '$lib/icons/Nais.svelte';
	import { Skeleton } from '@nais/ds-svelte-community';
	import {
		ExclamationmarkTriangleFillIcon,
		QuestionmarkDiamondFillIcon
	} from '@nais/ds-svelte-community/icons';
	$: teamName = $page.params.team;
	$: envName = $page.params.env;
	$: appName = $page.params.app;

	export let app: AppStatus;
	$: data = fragment(
		app,
		graphql(`
			fragment AppStatus on App {
				status @loading {
					state @loading
					errors {
						__typename
						level
					}
				}
			}
		`)
	);
	$: state = $data.status?.state;
</script>

<div class="card {state.toString()}">
	{#if $data.status.state == PendingValue}
		<h4>Status</h4>
		<Skeleton variant="rectangle" />
	{:else if $data.status.state === 'NAIS'}
		<h4>Status</h4>
		<div class="iconWrapper">
			<Nais
				size="5rem"
				style="color: var(--a-icon-success)"
				aria-label="Application is nais"
				role="image"
			/>
			{#if $data.status?.errors.length > 0}
				<p>
					<a href="/team/{teamName}/{envName}/app/{appName}/status"
						>{$data.status.errors.length} todo{$data.status.errors.length > 1 ? 's' : ''}</a
					>
				</p>
			{/if}
		</div>
	{:else if $data.status.state === 'FAILING'}
		<h4>Status <ExclamationmarkTriangleFillIcon style="color: var(--a-icon-danger)" /></h4>
		<div>
			Application is failing.<br />
			<a class="status" href="/team/{teamName}/{envName}/app/{appName}/status">
				{$data.status.errors.length}
				{$data.status.errors.length > 1 ? 'issues' : 'issue'}
			</a> detected.
		</div>
	{:else if $data.status.state === 'NOTNAIS'}
		<h4>Status <ExclamationmarkTriangleFillIcon style="color: var(--a-icon-warning)" /></h4>
		<div>
			Application is not nais.<br />
			<a class="status" href="/team/{teamName}/{envName}/app/{appName}/status">
				{$data.status.errors.length}
				{$data.status.errors.length > 1 ? 'issues' : 'issue'}
			</a>
			detected.
		</div>
	{:else if $data.status.state === 'UNKNOWN'}
		<h4>Status <QuestionmarkDiamondFillIcon /></h4>
		<div>Application status is unknown.</div>
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
		grid-column: span 4;
		grid-row: span 1;
		border: 1px solid var(--a-gray-200);
		background-color: var(--a-bg-default);
	}

	.UNKOWN {
		background-color: var(--a-bg-default);
	}

	.NAIS {
		background-color: var(--a-bg-default);
	}

	.NOTNAIS {
		background-color: var(--a-surface-warning-moderate);
		color: var(--a-text-on-warning);
		border: 1px solid var(--a-border-warning);
	}

	.FAILING {
		background-color: var(--a-surface-danger-subtle);
		border: 1px solid var(--a-border-danger);
	}
</style>
