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
		gap: 0.35rem;
		color: var(--destructive);
		font-weight: 500;
		line-height: 1.4;
	}
	.sh-error-message--medium {
		font-size: 0.8125rem;
	}
	.sh-error-message--small {
		font-size: 0.75rem;
	}
	.sh-error-message--spacing {
		margin-bottom: 0.5rem;
	}
</style>
