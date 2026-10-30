<script lang="ts">
	import { CheckmarkIcon } from '#lib/icons/index.js';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLButtonAttributes, 'value'> {
		selected?: boolean;
		value?: string;
		variant?: 'action' | 'neutral';
		checkmark?: boolean;
		children?: Snippet;
		onclick?: (e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) => void;
		onclickcapture?: (e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) => void;
		[key: string]: unknown;
	}

	let {
		selected = $bindable(false),
		value,
		checkmark = true,
		class: className = '',
		children,
		onclick,
		...rest
	}: Props = $props();
</script>

<li class="sh-chip-li">
	<button
		type="button"
		aria-pressed={selected}
		class={['sh-toggle-chip', { selected }, className]}
		onclick={(e) => {
			selected = !selected;
			onclick?.(e);
		}}
		{...rest}
	>
		{#if selected && checkmark}
			<CheckmarkIcon aria-hidden="true" />
		{/if}
		<span>
			{#if children}
				{@render children()}
			{:else}
				{value}
			{/if}
		</span>
	</button>
</li>

<style>
	.sh-chip-li {
		display: inline-flex;
	}
	.sh-toggle-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.25rem 0.625rem;
		border: 1px solid var(--border);
		border-radius: 9999px;
		background-color: var(--card);
		color: var(--muted-foreground);
		font-family: inherit;
		font-size: 0.78125rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			background-color 110ms ease,
			border-color 110ms ease,
			color 110ms ease;
	}
	.sh-toggle-chip:hover {
		background-color: var(--secondary);
		color: var(--foreground);
	}
	.sh-toggle-chip.selected {
		background-color: var(--accent);
		border-color: var(--primary);
		color: var(--accent-foreground);
		font-weight: 600;
	}
</style>
