<script lang="ts">
	import StatusIndicator from '#lib/ui/StatusIndicator.svelte';
	import { Loader } from '#lib/shadcn/ui/index.js';

	let { state }: { state: string } = $props();
</script>

<span class="status-indicator" aria-hidden="true">
	{#if state === 'AVAILABLE'}
		<StatusIndicator tone="success" />
	{:else if state === 'PROGRESSING'}
		<Loader size="xsmall" />
	{:else}
		<StatusIndicator tone={state === 'DEGRADED' ? 'danger' : 'neutral'} />
	{/if}
</span>

<style>
	.status-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--nais-space-24);
		height: var(--nais-space-24);
		flex-shrink: 0;
	}
</style>
