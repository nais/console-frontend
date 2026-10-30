<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		children: Snippet;
		headerAside?: Snippet;
		bordered?: boolean;
		level?: 'h2' | 'h3' | 'h4';
		eyebrow?: boolean;
	}

	let {
		title,
		children,
		headerAside,
		bordered = false,
		level = 'h2',
		eyebrow = true
	}: Props = $props();
</script>

<div class="surface-card {bordered ? 'surface-card-bordered' : ''}">
	{#if title || headerAside}
		<div class="header">
			{#if title}
				<svelte:element this={level} class={eyebrow ? 'card-eyebrow' : 'card-title'}
					>{title}</svelte:element
				>
			{/if}
			{#if headerAside}
				<div class="header-aside">
					{@render headerAside()}
				</div>
			{/if}
		</div>
	{/if}

	<div class="content">
		{@render children()}
	</div>
</div>

<style>
	.surface-card {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		width: 100%;
		min-width: 0;
		padding: 1.125rem 1.25rem;
		background-color: var(--card);
		color: var(--card-foreground);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		box-shadow: var(--sh-shadow-xs);
	}

	.surface-card-bordered {
		background-color: var(--background-subtle);
		border-color: var(--border);
		box-shadow: var(--sh-shadow-xs);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.card-eyebrow {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--foreground);
	}

	.card-title {
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--foreground);
	}

	.header-aside {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		width: 100%;
		min-width: 0;
	}

	@media (max-width: 767px), (max-height: 500px) {
		.surface-card {
			padding: 0.875rem 1rem;
		}
	}
</style>
