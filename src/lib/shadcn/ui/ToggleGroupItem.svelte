<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { GetToggleGroupContext } from './ToggleGroup.svelte';

	interface Props extends HTMLButtonAttributes {
		value: string;
		children: Snippet;
		[key: string]: unknown;
	}

	let { value, class: className = '', children, ...rest }: Props = $props();

	const ctx = GetToggleGroupContext();
	let isSelected = $derived(ctx?.value === value);
</script>

<button
	type="button"
	role="radio"
	aria-checked={isSelected}
	data-selected={isSelected}
	class={['sh-toggle-group-item', { selected: isSelected }, className]}
	onclick={() => ctx?.setValue(value)}
	{...rest}
>
	{@render children()}
</button>

<style>
	.sh-toggle-group-item {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		padding: 0.3rem 0.65rem;
		border: none;
		border-radius: calc(var(--radius) - 4px);
		background: transparent;
		color: var(--muted-foreground);
		font-family: inherit;
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		white-space: nowrap;
		transition:
			background-color 110ms ease,
			color 110ms ease;
	}
	.sh-toggle-group-item:hover {
		color: var(--foreground);
	}
	.sh-toggle-group-item.selected {
		background-color: var(--card);
		color: var(--foreground);
		font-weight: 600;
		box-shadow: var(--sh-shadow-xs);
	}
</style>
