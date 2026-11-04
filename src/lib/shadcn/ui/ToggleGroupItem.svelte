<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { GetToggleGroupContext } from './ToggleGroup.svelte';
	import { focusGroupItem } from './keyboardNavigation.js';

	interface Props extends HTMLButtonAttributes {
		value: string;
		children: Snippet;
		[key: string]: unknown;
	}

	let { value, class: className = '', children, onkeydown, ...rest }: Props = $props();

	const ctx = GetToggleGroupContext();
	let isSelected = $derived(ctx?.value === value);
</script>

<button
	type="button"
	role="radio"
	aria-checked={isSelected}
	tabindex={isSelected ? 0 : -1}
	data-selected={isSelected}
	class={['sh-toggle-group-item', { selected: isSelected }, className]}
	onclick={() => ctx?.setValue(value)}
	onkeydown={(event) => {
		onkeydown?.(event);
		const group = event.currentTarget.closest<HTMLElement>('[role="radiogroup"]');
		if (group && !event.defaultPrevented) {
			focusGroupItem(event, group, '[role="radio"]', 'horizontal')?.click();
		}
	}}
	{...rest}
>
	{@render children()}
</button>

<style>
	.sh-toggle-group-item {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--ax-space-6);
		padding: var(--ax-space-4) var(--ax-space-10);
		border: none;
		border-radius: var(--radius-2xs);
		background: transparent;
		color: var(--muted-foreground);
		font-family: inherit;
		font-size: var(--ax-font-size-small);
		font-weight: var(--sh-font-weight-medium);
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
		font-weight: var(--sh-font-weight-semibold);
		box-shadow: var(--sh-shadow-xs);
	}
</style>
