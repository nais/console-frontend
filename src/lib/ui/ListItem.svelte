<script lang="ts">
	import type { Snippet } from 'svelte';

	const { children, href }: { children: Snippet; href?: string } = $props();
</script>

{#if href}
	<a {href} class="list-item">
		{@render children()}
	</a>
{:else}
	<div class="list-item">
		{@render children()}
	</div>
{/if}

<style>
	.list-item {
		background-color: var(--ax-neutral-100);
		display: grid;
		grid-template-columns: 1fr;
		grid-auto-flow: column;
		align-items: center;
		column-gap: var(--ax-space-16);
		padding: var(--ax-space-16) var(--ax-space-24);
		color: inherit;
		text-decoration: none;

		&:hover {
			background-color: var(--ax-neutral-300);
		}
	}
</style>
