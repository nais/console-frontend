<script lang="ts">
	import { Alert, Button } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="chart-boundary">
	<svelte:boundary onerror={(e) => console.error('Chart render error:', e)}>
		{@render children()}

		{#snippet failed(error, reset)}
			{void error}
			<div class="fallback">
				<Alert variant="warning" size="small" fullWidth={false}>
					Chart failed to render.
					<Button variant="tertiary" size="xsmall" onclick={reset}>Retry</Button>
				</Alert>
			</div>
		{/snippet}
	</svelte:boundary>
</div>

<style>
	.chart-boundary {
		width: 100%;
		height: 100%;
		min-width: 0;
		min-height: 0;
		flex: 1 1 0;
	}

	.fallback {
		display: flex;
		width: 100%;
		height: 100%;
		align-items: center;
		justify-content: center;
	}
</style>
