<script lang="ts">
	import { ChevronDownIcon } from '#lib/icons/index.js';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Heading from './Heading.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		open?: boolean;
		defaultOpen?: boolean;
		onOpenChange?: (open: boolean) => void;
		heading?: string | Snippet;
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		open = undefined,
		defaultOpen = false,
		onOpenChange,
		heading,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	let isControlled = $derived(open !== undefined);
	let uncontrolledOpen = $state(false);
	$effect(() => {
		if (!isControlled) uncontrolledOpen = defaultOpen;
	});
	let currentOpen = $derived(isControlled ? Boolean(open) : uncontrolledOpen);

	function toggleOpen() {
		const next = !currentOpen;
		if (!isControlled) {
			uncontrolledOpen = next;
		}
		onOpenChange?.(next);
	}
</script>

<div
	class={['sh-accordion-item', { 'sh-accordion-item--open': currentOpen }, className]}
	data-expanded={currentOpen}
	{...rest}
>
	{#if heading}
		<button
			type="button"
			class="sh-accordion-header"
			aria-expanded={currentOpen}
			onclick={toggleOpen}
		>
			<span class="sh-accordion-chevron" class:open={currentOpen}>
				<ChevronDownIcon aria-hidden="true" />
			</span>
			<Heading size="xsmall" as="span">
				{#if typeof heading === 'string'}
					{heading}
				{:else}
					{@render heading()}
				{/if}
			</Heading>
		</button>

		<div class={['sh-accordion-content', { 'sh-accordion-content--closed': !currentOpen }]}>
			<div class="sh-accordion-content-inner">
				{@render children()}
			</div>
		</div>
	{:else}
		{@render children()}
	{/if}
</div>

<style>
	.sh-accordion-item {
		border-bottom: 1px solid var(--border);
	}
	.sh-accordion-header {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 0.25rem;
		border: none;
		background: transparent;
		color: var(--foreground);
		text-align: left;
		cursor: pointer;
	}
	.sh-accordion-chevron {
		display: inline-flex;
		align-items: center;
		color: var(--muted-foreground);
		transition: transform 150ms ease;
	}
	.sh-accordion-chevron.open {
		transform: rotate(180deg);
	}
	.sh-accordion-content--closed {
		display: none;
	}
	.sh-accordion-content {
		padding: 0.25rem 0 0.875rem;
	}
</style>
