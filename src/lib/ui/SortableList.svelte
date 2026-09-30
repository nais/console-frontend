<script lang="ts">
	import Sortable from 'sortablejs';
	import type { Snippet } from 'svelte';

	// Props
	const {
		items = [],
		onReorder,
		children
	}: {
		items: string[];
		onReorder: (newOrder: string[]) => void;
		children: Snippet;
	} = $props();

	function setupSortable(el: HTMLElement) {
		const sortable = Sortable.create(el, {
			animation: 150,
			handle: '.drag-handle',
			onEnd: (evt) => {
				const oldIndex = evt.oldIndex;
				const newIndex = evt.newIndex;

				if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return;

				const updated = [...items];
				const [moved] = updated.splice(oldIndex, 1);
				updated.splice(newIndex, 0, moved);

				onReorder?.(updated);
			}
		});

		return () => sortable.destroy();
	}
</script>

<div {@attach setupSortable} class="list">
	{@render children()}
</div>

<style>
	.list {
		display: flex;
		flex-direction: column;
	}
</style>
