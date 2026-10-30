<script lang="ts">
	import { ChevronDownIcon } from '#lib/icons/index.js';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		header: string | Snippet;
		defaultOpen?: boolean;
		open?: boolean;
		size?: 'large' | 'medium' | 'small';
		variant?: 'moderate' | 'ghost';
		onopenchange?: (open: boolean) => void;
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		header,
		defaultOpen = false,
		open = $bindable(undefined),
		size = 'medium',
		variant = 'ghost',
		onopenchange,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	let internalOpen = $state(false);
	$effect(() => {
		if (open === undefined) internalOpen = defaultOpen;
	});
	let isOpen = $derived(open !== undefined ? open : internalOpen);

	function toggle() {
		const next = !isOpen;
		if (open !== undefined) {
			open = next;
		} else {
			internalOpen = next;
		}
		onopenchange?.(next);
	}
</script>

<div
	class={['sh-readmore', `size-${size}`, `variant-${variant}`, { open: isOpen }, className]}
	{...rest}
>
	<button type="button" class="sh-readmore-btn" aria-expanded={isOpen} onclick={toggle}>
		<span class="sh-readmore-chevron" class:open={isOpen} aria-hidden="true">
			<ChevronDownIcon />
		</span>
		<span>
			{#if typeof header === 'string'}
				{header}
			{:else}
				{@render header()}
			{/if}
		</span>
	</button>
	<div class={['sh-readmore-content', { closed: !isOpen }]}>
		{@render children()}
	</div>
</div>

<style>
	.sh-readmore {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.sh-readmore-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.25rem 0.4rem;
		margin-left: -0.4rem;
		width: fit-content;
		border: none;
		border-radius: calc(var(--radius) - 3px);
		background: transparent;
		color: var(--primary);
		font-family: inherit;
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
	}
	.sh-readmore-btn:hover {
		background-color: var(--secondary);
	}
	.sh-readmore-chevron {
		display: inline-flex;
		align-items: center;
		transition: transform 150ms ease;
	}
	.sh-readmore-chevron.open {
		transform: rotate(180deg);
	}
	.sh-readmore-content {
		padding-left: 1.25rem;
		border-left: 2px solid var(--border);
		font-size: 0.84375rem;
		color: var(--muted-foreground);
	}
	.sh-readmore-content.closed {
		display: none;
	}
</style>
