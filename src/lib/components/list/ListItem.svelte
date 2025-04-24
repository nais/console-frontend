<script lang="ts">
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();
</script>

<div class="list-item">
	{@render children()}
</div>

<style>
	.list-item {
		background-color: var(--ax-neutral-100);
		display: grid;
		grid-template-columns: 1fr;
		grid-auto-flow: column;
		align-items: center;
		column-gap: var(--ax-space-16, --a-spacing-4);
		padding: var(--ax-space-16, --a-spacing-4) var(--ax-space-24, --a-spacing-6);

		&:hover {
			background-color: var(--ax-neutral-300);
		}
	}
</style>
