<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		[key: string]: unknown;
	}

	let { class: className = '', children, ...rest }: Props = $props();
</script>

<div role="tablist" class={['sh-ui-tablist', className]} {...rest}>
	{@render children()}
</div>

<style>
	.sh-ui-tablist {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		border-bottom: 1px solid var(--border);
		overflow-x: auto;
	}
</style>
