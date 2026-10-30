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
		padding: 0.125rem;
		border: none;
		border-radius: 9999px;
		background: transparent;
		color: var(--muted-foreground);
		cursor: pointer;
	}
	.sh-helptext-btn:hover {
		color: var(--foreground);
	}
	.sh-helptext-popover {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		z-index: 50;
		min-width: 14rem;
		max-width: 20rem;
		padding: 0.625rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background-color: var(--popover);
		color: var(--popover-foreground);
		box-shadow: var(--sh-shadow-md);
		font-size: 0.8125rem;
		line-height: 1.45;
	}
</style>
