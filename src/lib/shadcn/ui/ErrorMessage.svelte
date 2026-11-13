<script lang="ts">
	import { ExclamationmarkTriangleFillIcon } from '#lib/icons/index.js';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		as?: string;
		size?: 'medium' | 'small';
		spacing?: boolean;
		showIcon?: boolean;
		children?: Snippet;
		[key: string]: unknown;
	}

	let {
		as = 'p',
		size = 'medium',
		spacing = false,
		showIcon = false,
		class: className = '',
		children,
		...rest
	}: Props = $props();
</script>

<svelte:element
	this={as}
	class={[
		'sh-error-message',
		`sh-error-message--${size}`,
		{ 'sh-error-message--spacing': spacing },
		className
	]}
	{...rest}
>
	{#if showIcon}
		<ExclamationmarkTriangleFillIcon aria-hidden="true" />
	{/if}
	<span>{@render children?.()}</span>
</svelte:element>

<style>
	.sh-error-message {
		margin: 0;
		display: inline-flex;
		align-items: center;
		gap: var(--nais-space-6);
		color: var(--destructive);
		font-weight: var(--sh-font-weight-medium);
		line-height: 1.4;
	}
	.sh-error-message--medium {
		font-size: var(--sh-font-size-sm);
	}
	.sh-error-message--small {
		font-size: var(--sh-font-size-xs);
	}
	.sh-error-message--spacing {
		margin-bottom: var(--nais-space-8);
	}
</style>
