<script lang="ts" module>
	import { getContext, hasContext } from 'svelte';

	export interface ToggleGroupContext {
		readonly value: string;
		readonly size: 'medium' | 'small';
		setValue(value: string): void;
	}

	const contextKey = Symbol('ToggleGroupContext');

	export function GetToggleGroupContext(): ToggleGroupContext | undefined {
		if (!hasContext(contextKey)) return undefined;
		return getContext<ToggleGroupContext>(contextKey);
	}
</script>

<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Label from './Label.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
		value: string;
		size?: 'medium' | 'small';
		label?: string;
		variant?: 'action' | 'neutral';
		fill?: boolean;
		children: Snippet;
		onchange?: (value: string) => void;
		[key: string]: unknown;
	}

	let {
		value = $bindable(''),
		size = 'medium',
		label,
		fill = false,
		children,
		onchange,
		class: className = '',
		...rest
	}: Props = $props();

	const ctx: ToggleGroupContext = {
		get value() {
			return value;
		},
		get size() {
			return size;
		},
		setValue(next: string) {
			if (value === next) return;
			value = next;
			onchange?.(next);
		}
	};

	setContext(contextKey, ctx);
</script>

<div class={['sh-toggle-group-wrapper', className]} {...rest}>
	{#if label}
		<Label {size} as="div" spacing>{label}</Label>
	{/if}
	<div role="radiogroup" aria-label={label} class={['sh-toggle-group', `size-${size}`, { fill }]}>
		{@render children()}
	</div>
</div>

<style>
	.sh-toggle-group-wrapper {
		display: inline-flex;
		flex-direction: column;
	}
	.sh-toggle-group {
		display: inline-flex;
		align-items: center;
		gap: 0.15rem;
		padding: 0.1875rem;
		background-color: var(--muted);
		border: 1px solid var(--border);
		border-radius: calc(var(--radius) - 2px);
	}
	.sh-toggle-group.fill {
		display: flex;
		width: 100%;
	}
</style>
