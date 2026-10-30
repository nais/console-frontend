<script lang="ts">
	import PageHeader from '#lib/ui/PageHeader.svelte';
	import { createHeaderActionsContext } from '#lib/ui/headerActionsContext.svelte.js';
	import { Alert, BodyShort, Button, Heading } from '#lib/shadcn/ui/index.js';
	import type { LayoutProps } from './$types';
	import { createTeamContext } from './teamContext.svelte';

	let { data, children }: LayoutProps = $props();
	let { deletionInProgress, lastSuccessfulSync } = $derived(data);

	createTeamContext();
	createHeaderActionsContext();
</script>

<div class="team-workspace">
	{#if deletionInProgress}
		<div class="team-banner warning">
			The team and all of its resources is currently being deleted.
		</div>
	{/if}
	{#if !lastSuccessfulSync && !deletionInProgress}
		<div class="team-banner info">
			The team and all of its resources is currently being created. Expected time to completion is
			about 15 minutes.
		</div>
	{/if}

	<main class="team-main">
		<PageHeader />
		<div class="team-body">
			<svelte:boundary onerror={(e) => console.error('Team page render error:', e)}>
				{@render children?.()}

				{#snippet failed(error, reset)}
					{void error}
					<Alert variant="error">
						<Heading size="xsmall" as="h2">Something went wrong</Heading>
						<BodyShort>An unexpected error occurred while rendering the page.</BodyShort>
						<Button variant="secondary" size="small" onclick={reset}>Try again</Button>
					</Alert>
				{/snippet}
			</svelte:boundary>
		</div>
	</main>
</div>

<style>
	.team-workspace {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		width: 100%;
		min-width: 0;
	}

	.team-banner {
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		font-size: 0.875rem;
		font-weight: 500;
		border: 1px solid var(--border);
	}

	.team-banner.warning {
		background-color: var(--warning-muted);
		border-color: var(--warning-border);
		color: var(--warning);
	}

	.team-banner.info {
		background-color: var(--info-muted);
		border-color: var(--info-border);
		color: var(--info);
	}

	.team-main {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		min-width: 0;
	}

	.team-body {
		min-width: 0;
	}
</style>
