<script lang="ts">
	import { Heading } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';

	let { title, children, menu }: { title?: string; children: Snippet; menu?: Snippet } = $props();
</script>

<div class="wrapper">
	{#if title}
		<div class="header">
			<Heading size="small" level="3">{title}</Heading>
			{#if menu}
				<div>{@render menu()}</div>
			{/if}
		</div>
	{/if}
	{@render children()}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: 2px;

		:global(> *) {
			background-color: #f7f8f9;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: var(--a-spacing-4) var(--a-spacing-6);

			&:first-child {
				border-top-left-radius: 12px;
				border-top-right-radius: 12px;
			}

			&:last-child {
				border-bottom-left-radius: 12px;
				border-bottom-right-radius: 12px;
			}

			&:not(.header):hover {
				background-color: var(--a-surface-subtle);
			}
		}

		:global(a) {
			color: inherit;
			text-decoration: none;

			&:hover {
				text-decoration: underline;
			}

			&:active,
			&:focus {
				color: var(--a-text-on-inverted);
			}
		}
	}
</style>
