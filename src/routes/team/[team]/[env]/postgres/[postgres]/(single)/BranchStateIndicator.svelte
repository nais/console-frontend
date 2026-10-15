<script lang="ts">
	import RunningIndicator from '#lib/ui/RunningIndicator.svelte';
	import { Loader } from '@nais/ds-svelte-community';

	let { state }: { state: string } = $props();
</script>

<span class="status-indicator" aria-hidden="true">
	{#if state === 'AVAILABLE'}
		<span><RunningIndicator /></span>
	{:else if state === 'PROGRESSING'}
		<Loader size="xsmall" />
	{:else}
		<span class={['status-dot', { degraded: state === 'DEGRADED' }]}></span>
	{/if}
</span>

<style>
	.status-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--ax-space-24);
		height: var(--ax-space-24);
		flex-shrink: 0;
	}
	.status-indicator > span {
		display: inline-flex;
	}
	.status-dot {
		width: var(--ax-space-8);
		height: var(--ax-space-8);
		border-radius: var(--ax-radius-full);
		background-color: var(--ax-text-neutral-decoration);
	}
	.status-dot.degraded {
		background-color: var(--ax-text-danger-decoration);
	}
</style>
