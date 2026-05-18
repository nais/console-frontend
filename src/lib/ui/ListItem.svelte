<script lang="ts">
	import type { Snippet } from 'svelte';

	const {
		children,
		href,
		interactive = false
	}: { children: Snippet; href?: string; interactive?: boolean } = $props();
</script>

{#if href}
	<a {href} class="list-item" class:interactive>
		{@render children()}
	</a>
{:else}
	<div class="list-item" class:interactive>
		{@render children()}
	</div>
{/if}

<style>
	.list-item {
		background: var(--ax-bg-default);
		display: grid;
		grid-template-columns: 1fr;
		grid-auto-flow: column;
		align-items: center;
		column-gap: var(--ax-space-16);
		min-width: 0;
		max-width: 100%;
		padding: var(--ax-space-12) var(--ax-space-24);
		color: inherit;
		text-decoration: none;
		border-bottom: 1px solid var(--ax-border-neutral-subtleA);
	}

	.list-item > :global(*) {
		min-width: 0;
		max-width: 100%;
	}

	@media (max-width: 767px), (max-height: 500px) {
		.list-item {
			grid-auto-flow: row;
			padding: var(--ax-space-12) var(--ax-space-16);
		}
	}

	.interactive {
		transition:
			background-color 120ms ease,
			box-shadow 120ms ease;
	}

	.interactive:hover {
		background: color-mix(in srgb, var(--surface-accent-color) 6%, var(--ax-bg-default));
	}

	a.list-item:not(.interactive):hover {
		background: var(--ax-neutral-200);
	}

	a.list-item:focus-visible {
		outline: 2px solid var(--ax-border-focus);
		outline-offset: -2px;
	}
</style>
