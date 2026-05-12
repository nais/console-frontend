<script lang="ts">
	import { Box } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		children: Snippet;
		headerAside?: Snippet;
		bordered?: boolean;
	}

	let { title, children, headerAside, bordered = false }: Props = $props();
</script>

<Box
	borderRadius="12"
	padding="space-16"
	class="surface-card {bordered ? 'surface-card-bordered' : ''}"
>
	{#if title || headerAside}
		<div class="header">
			{#if title}
				<h2 class="eyebrow">{title}</h2>
			{/if}
			{#if headerAside}
				{@render headerAside()}
			{/if}
		</div>
	{/if}

	<div class="content">
		{@render children()}
	</div>
</Box>

<style>
	:global(.surface-card) {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-12);
		width: 100%;
		min-width: 0;
	}

	:global(.surface-card-bordered) {
		background: color-mix(in srgb, var(--ax-border-neutral-subtleA) 15%, var(--ax-bg-default));
		box-shadow: 0 8px 8px -8px var(--ax-border-neutral-subtleA);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--ax-space-8);
	}

	.eyebrow {
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-bold);
		line-height: var(--ax-font-line-height-large);
		color: var(--ax-text-neutral-subtle);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin: 0;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		width: 100%;
		min-width: 0;
	}

	@media (max-width: 767px), (max-height: 500px) {
		:global(.surface-card) {
			padding: var(--ax-space-12);
		}
	}
</style>
