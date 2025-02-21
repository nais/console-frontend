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
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--a-spacing-4) var(--a-spacing-6);

		&:hover {
			background-color: var(--a-surface-subtle);
		}
	}
</style>
