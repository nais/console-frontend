<script lang="ts">
	import { BodyLong, Heading } from '#lib/shadcn/ui/index.js';
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		children
	}: {
		title: string;
		description?: string;
		children?: Snippet;
	} = $props();
</script>

<div class="empty-state">
	<Heading as="h3" size="small">{title}</Heading>
	{#if description}
		<BodyLong>{description}</BodyLong>
	{/if}
	{#if children}
		<div class="empty-actions">{@render children()}</div>
	{/if}
</div>

<style>
	.empty-state {
		display: grid;
		justify-items: center;
		gap: var(--ax-space-12);
		padding: var(--ax-space-40) var(--ax-space-24);
		text-align: center;
		overflow-wrap: anywhere;
	}

	.empty-actions {
		font-size: var(--sh-font-size-sm);
	}
</style>
