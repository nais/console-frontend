<script lang="ts">
	import type { Snippet } from 'svelte';

	const {
		children,
		href,
		interactive = false,
		highlight = false
	}: { children: Snippet; href?: string; interactive?: boolean; highlight?: boolean } = $props();
</script>

{#if href}
	<a {href} class="list-item" class:interactive>
		{@render children()}
	</a>
{:else}
	<div class="animatable" class:highlight>
		<div class="list-item" class:interactive>
			{@render children()}
		</div>
	</div>
{/if}

<style>
	.list-item {
		background: var(--card);
		display: grid;
		grid-template-columns: 1fr;
		grid-auto-flow: column;
		align-items: center;
		column-gap: var(--nais-space-16);
		min-width: 0;
		max-width: 100%;
		padding: var(--nais-space-12) var(--nais-space-20);
		color: var(--card-foreground);
		text-decoration: none;
		border-bottom: var(--sh-border-width) solid var(--border-subtle);
		transition: background-color 120ms ease;
	}

	.list-item > :global(*) {
		min-width: 0;
		max-width: 100%;
	}

	@container (max-width: 500px) {
		.list-item {
			grid-auto-flow: row;
			padding: var(--nais-space-12) var(--nais-space-16);
		}
	}

	@media (max-width: 767px), (max-height: 500px) {
		.list-item {
			grid-auto-flow: row;
			padding: var(--nais-space-12) var(--nais-space-16);
		}
	}

	.interactive {
		transition:
			background-color 120ms ease,
			box-shadow 120ms ease;
	}

	.interactive:hover,
	a.list-item:hover {
		background: color-mix(in srgb, var(--primary) 5%, var(--card));
	}

	a.list-item:focus-visible {
		outline: var(--nais-space-2) solid var(--ring);
		outline-offset: calc(-1 * var(--nais-space-2));
	}

	.animatable {
		transition:
			background-color 0.8s ease,
			opacity 0.8s ease,
			padding-left 0.8s ease;
	}

	.highlight {
		background-color: var(--brand-muted);
		padding-left: var(--nais-space-8);
		opacity: 1;
	}
</style>
