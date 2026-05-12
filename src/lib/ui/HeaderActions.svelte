<script lang="ts">
	import { getHeaderActionsContext } from '$lib/ui/headerActionsContext.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
	const ctx = getHeaderActionsContext();

	if (ctx) {
		$effect(() => {
			ctx.snippet = children;
			return () => {
				ctx.snippet = null;
			};
		});
	}
</script>
