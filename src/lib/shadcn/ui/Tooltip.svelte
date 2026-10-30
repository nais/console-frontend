<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		content: string;
		open?: boolean;
		defaultOpen?: boolean;
		placement?: 'top' | 'right' | 'bottom' | 'left';
		arrow?: boolean;
		offset?: number;
		delay?: number;
		maxChar?: number;
		describesChild?: boolean;
		keys?: string[];
		children: Snippet<[{ props: Record<string, unknown> }]>;
		[key: string]: unknown;
	}
</script>

<script lang="ts">
	let {
		content,
		open = $bindable(undefined),
		defaultOpen = false,
		placement = 'top',
		keys,
		children
	}: TooltipProps = $props();

	const uid = $props.id();
	let hovered = $state(false);
	let isOpen = $derived(open !== undefined ? open : hovered || defaultOpen);

	let triggerProps = $derived({
		title: content,
		'aria-describedby': isOpen ? uid : undefined,
		onmouseenter: () => {
			hovered = true;
		},
		onmouseleave: () => {
			hovered = false;
		},
		onfocus: () => {
			hovered = true;
		},
		onblur: () => {
			hovered = false;
		}
	});
</script>

<span class="sh-tooltip-anchor" data-placement={placement}>
	{@render children({ props: triggerProps })}
	{#if isOpen}
		<span id={uid} role="tooltip" class={['sh-tooltip-bubble', `placement-${placement}`]}>
			<span>{content}</span>
			{#if keys?.length}
				<span class="sh-tooltip-keys">
					{#each keys as k (k)}
						<kbd>{k}</kbd>
					{/each}
				</span>
			{/if}
		</span>
	{/if}
</span>

<style>
	.sh-tooltip-anchor {
		position: relative;
		display: inline-flex;
		align-items: center;
	}
	.sh-tooltip-bubble {
		position: absolute;
		z-index: 60;
		bottom: calc(100% + 6px);
		left: 50%;
		transform: translateX(-50%);
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.3rem 0.55rem;
		border-radius: calc(var(--radius) - 3px);
		background-color: var(--popover);
		color: var(--popover-foreground);
		border: 1px solid var(--border);
		box-shadow: var(--sh-shadow-md);
		font-size: 0.75rem;
		font-weight: 500;
		white-space: nowrap;
		pointer-events: none;
	}
	.sh-tooltip-bubble.placement-bottom {
		bottom: auto;
		top: calc(100% + 6px);
	}
	.sh-tooltip-keys {
		display: inline-flex;
		gap: 0.15rem;
	}
	.sh-tooltip-keys kbd {
		padding: 0.05rem 0.25rem;
		border: 1px solid var(--border);
		border-radius: 3px;
		font-size: 0.6875rem;
		font-family: var(--font-mono);
	}
</style>
