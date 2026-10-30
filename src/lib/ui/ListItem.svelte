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
		column-gap: 1rem;
		min-width: 0;
		max-width: 100%;
		padding: 0.75rem 1.25rem;
		color: var(--card-foreground);
		text-decoration: none;
		border-bottom: 1px solid var(--border-subtle);
		transition: background-color 120ms ease;
	}

	.list-item > :global(*) {
		min-width: 0;
		max-width: 100%;
	}

	@container (max-width: 500px) {
		.list-item {
			grid-auto-flow: row;
			padding: 0.75rem 1rem;
		}
	}

	@media (max-width: 767px), (max-height: 500px) {
		.list-item {
			grid-auto-flow: row;
			padding: 0.75rem 1rem;
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
		outline: 2px solid var(--ring);
		outline-offset: -2px;
	}

	.animatable {
		transition:
			background-color 0.8s ease,
			opacity 0.8s ease,
			padding-left 0.8s ease;
	}

	.highlight {
		background-color: var(--brand-muted);
		padding-left: 0.5rem;
		opacity: 1;
	}
</style>
