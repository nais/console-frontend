<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { GetTabsUiContext } from './Tabs.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value: string;
		children: Snippet;
	}

	let { value, children, ...rest }: Props = $props();
	const ctx = GetTabsUiContext();
</script>

<div
	role="tabpanel"
	id={ctx?.panelId(value)}
	aria-labelledby={ctx?.tabId(value)}
	hidden={ctx?.value !== value}
	tabindex="0"
	{...rest}
>
	{@render children()}
</div>
