<script lang="ts">
	import { QuestionmarkCircleIcon } from '#lib/icons/index.js';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		title?: string;
		wrapperClass?: string;
		strategy?: 'absolute' | 'fixed';
		placement?: string;
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		title = 'More information',
		wrapperClass = '',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	let open = $state(false);
</script>

<div class={['sh-helptext-wrapper', wrapperClass]}>
	<button
		type="button"
		class={['sh-helptext-btn', className]}
		{title}
		aria-label={title}
		aria-expanded={open}
		onclick={(e) => {
			e.stopPropagation();
			open = !open;
		}}
		{...rest}
	>
		<QuestionmarkCircleIcon aria-hidden="true" />
	</button>
	{#if open}
		<div class="sh-helptext-popover" role="region" aria-label={title}>
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.sh-helptext-wrapper {
		position: relative;
		display: inline-flex;
		align-items: center;
	}
	.sh-helptext-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--ax-space-2);
		border: none;
		border-radius: var(--radius-full);
		background: transparent;
		color: var(--muted-foreground);
		cursor: pointer;
	}
	.sh-helptext-btn:hover {
		color: var(--foreground);
	}
	.sh-helptext-popover {
		position: absolute;
		top: calc(100% + var(--ax-space-6));
		left: 0;
		z-index: 50;
		min-width: var(--sh-popover-min-width);
		max-width: var(--sh-popover-max-width);
		padding: var(--ax-space-10) var(--ax-space-12);
		border: var(--sh-border-width) solid var(--border);
		border-radius: var(--radius);
		background-color: var(--popover);
		color: var(--popover-foreground);
		box-shadow: var(--sh-shadow-md);
		font-size: var(--sh-font-size-sm);
		line-height: 1.45;
	}
</style>
