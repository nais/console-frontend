<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		as?: 'div' | 'body';
		footerPosition?: 'belowFold';
		contentBlockPadding?: 'end' | 'none';
		children: Snippet;
		footer?: Snippet;
		[key: string]: unknown;
	}

	let { as = 'div', class: className = '', children, footer, ...rest }: Props = $props();
</script>

<svelte:element this={as} class={['sh-page', className]} {...rest}>
	<div class="sh-page-content">
		{@render children()}
	</div>
	{#if footer}
		{@render footer()}
	{/if}
</svelte:element>

<style>
	.sh-page {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
	.sh-page-content {
		flex: 1;
	}
</style>
