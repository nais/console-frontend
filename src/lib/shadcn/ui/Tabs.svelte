<script lang="ts" module>
	import { createContext } from 'svelte';

	export interface TabsUiContext {
		readonly value: string;
		readonly size: 'small' | 'medium';
		activate(value: string): void;
		tabId(value: string): string;
		panelId(value: string): string;
	}

	const [getTabsContext, setTabsContext, hasTabsContext] = createContext<TabsUiContext>();

	export function GetTabsUiContext(): TabsUiContext | undefined {
		return hasTabsContext() ? getTabsContext() : undefined;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
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
	const uid = $props.id();

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
		},
		tabId(value: string) {
			return `${uid}-tab-${encodeURIComponent(value)}`;
		},
		panelId(value: string) {
			return `${uid}-panel-${encodeURIComponent(value)}`;
		}
	};

	setTabsContext(ctx);
</script>

<div class={['sh-ui-tabs', className]} {...rest}>
	{@render children()}
</div>
