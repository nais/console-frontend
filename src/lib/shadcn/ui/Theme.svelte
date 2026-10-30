<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		theme?: 'light' | 'dark';
		hasBackground?: boolean;
		as?: string;
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		theme,
		hasBackground = true,
		as = 'div',
		class: className = '',
		children,
		...rest
	}: Props = $props();
</script>

<svelte:element
	this={as}
	class={[
		'sh-theme-root',
		theme,
		{ 'dark-theme': theme === 'dark', 'has-bg': hasBackground },
		className
	]}
	data-theme={theme}
	{...rest}
>
	{@render children()}
</svelte:element>

<style>
	.sh-theme-root.has-bg {
		background-color: var(--background);
		color: var(--foreground);
		min-height: 100vh;
	}
</style>
