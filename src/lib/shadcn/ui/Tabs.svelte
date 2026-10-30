<script lang="ts" module>
	import { getContext, hasContext } from 'svelte';

	export interface TabsUiContext {
		readonly value: string;
		readonly size: 'small' | 'medium';
		activate(value: string): void;
	}

	const contextKey = Symbol('TabsUiContext');

	export function GetTabsUiContext(): TabsUiContext | undefined {
		if (!hasContext(contextKey)) return undefined;
		return getContext<TabsUiContext>(contextKey);
	}
</script>

<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		size?: 'small' | 'medium';
		value?: string;
		defaultValue?: string;
		onChange?: (value: string) => void;
		fill?: boolean;
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		size = 'medium',
		value = $bindable(''),
		defaultValue = '',
		onChange,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	let current = $derived(value || defaultValue);

	const ctx: TabsUiContext = {
		get value() {
			return current;
		},
		get size() {
			return size;
		},
		activate(next: string) {
			value = next;
			onChange?.(next);
		}
	};

	setContext(contextKey, ctx);
</script>

<div class={['sh-ui-tabs', className]} {...rest}>
	{@render children()}
</div>
