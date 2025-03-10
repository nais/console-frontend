<script lang="ts">
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();
</script>

<div class="list-item">
	{@render children()}
</div>

<style>
	.list-item {
		background-color: #f7f8f9;
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		column-gap: var(--a-spacing-4);
		padding: var(--a-spacing-4) var(--a-spacing-6);

		&:hover {
			background-color: var(--a-surface-subtle);
		}
	}
</style>
