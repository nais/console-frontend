<script lang="ts">
	import { Heading } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';

	const { title, children, menu }: { title?: string; children: Snippet; menu?: Snippet } = $props();
</script>

<div class="list">
	{#if title}
		<div class="header">
			<Heading size="small" level="3">{title}</Heading>
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
			background-color: #f7f8f9;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: var(--a-spacing-4) var(--a-spacing-6);
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
		gap: var(--a-spacing-2);
	}
</style>
