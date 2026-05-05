<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		children: Snippet;
		headerAside?: Snippet;
		reverseGradient?: boolean;
	}

	let { title, children, headerAside, reverseGradient = false }: Props = $props();
</script>

<div class="card" class:reverse={reverseGradient}>
	{#if title || headerAside}
		<div class="header">
			{#if title}
				<span class="eyebrow">{title}</span>
			{/if}
			{#if headerAside}
				{@render headerAside()}
			{/if}
		</div>
	{/if}

	<div class="content">
		{@render children()}
	</div>
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		padding: var(--ax-space-16);
		border-radius: var(--ax-radius-8);
		background: var(--surface-elevated-background);
		box-shadow: var(--surface-elevated-shadow);
		width: 100%;
		min-width: 0;
	}

	.card.reverse {
		background: var(--surface-elevated-background-reverse, var(--surface-elevated-background));
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
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		width: 100%;
		min-width: 0;
	}

	@media (max-width: 767px), (max-height: 500px) {
		.card {
			padding: var(--ax-space-12);
		}
	}
</style>
