<script lang="ts">
	import { Alert, Button } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:boundary onerror={(e) => console.error('Chart render error:', e)}>
	{@render children()}

	{#snippet failed(error, reset)}
		<Alert variant="warning" size="small" data-error={error instanceof Error ? error.message : ''}>
			Chart failed to render.
			<Button variant="tertiary" size="xsmall" onclick={reset}>Retry</Button>
		</Alert>
	{/snippet}
</svelte:boundary>
