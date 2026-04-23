<script lang="ts">
	import { Heading } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';

	const { title, children, menu }: { title?: string; children: Snippet; menu?: Snippet } = $props();
</script>

<div class="list">
	{#if title}
		<div class="header">
			<Heading size="small" as="h3">{title}</Heading>
			{#if menu}
				<div class="menu">{@render menu()}</div>
			{/if}
		</div>
	{/if}
	{@render children()}
</div>

<style>
	.list {
		display: flex;
		flex-direction: column;
		gap: 2px;

		.header {
			background-color: var(--ax-neutral-100);
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: var(--ax-space-16) var(--ax-space-24);
		}

		:global(> *) {
			&:first-child {
				border-top-left-radius: 12px;
				border-top-right-radius: 12px;
			}

			&:last-child {
				border-bottom-left-radius: 12px;
				border-bottom-right-radius: 12px;
			}
		}
	}

	.menu {
		display: flex;
		gap: var(--ax-space-8);
	}

	.header :global(h3) {
		text-align: left;
	}

	@media (max-width: 767px) {
		.header {
			flex-wrap: wrap;
			gap: var(--ax-space-8);
			padding: var(--ax-space-12) var(--ax-space-16);
		}

		.menu {
			flex-wrap: wrap;
		}
	}
</style>
