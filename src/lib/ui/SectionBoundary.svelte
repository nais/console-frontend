<script lang="ts">
	import { Alert, Button } from '#lib/shadcn/ui/index.js';
	import type { Snippet } from 'svelte';

	let {
		children,
		message = 'This section failed to render.'
	}: { children: Snippet; message?: string } = $props();
</script>

<svelte:boundary onerror={(error) => console.error('Section render error:', error)}>
	{@render children()}

	{#snippet failed(error, reset)}
		{void error}
		<Alert variant="warning" size="small" fullWidth={false}>
			{message}
			<Button variant="tertiary" size="xsmall" onclick={reset}>Retry</Button>
		</Alert>
	{/snippet}
</svelte:boundary>
