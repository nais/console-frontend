<script lang="ts">
	import { Alert } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:boundary>
	{@render children()}

	{#snippet failed(error, reset)}
		<Alert variant="warning" size="small">
			Chart failed to render: {error instanceof Error ? error.message : 'unknown error'}.
			<button class="retry" onclick={reset}>Retry</button>
		</Alert>
	{/snippet}
</svelte:boundary>

<style>
	.retry {
		background: none;
		border: none;
		color: var(--ax-text-accent);
		cursor: pointer;
		text-decoration: underline;
		padding: 0;
		font: inherit;
	}
</style>
