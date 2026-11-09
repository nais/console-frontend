<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		value?: string;
		type?: 'text' | 'search' | 'email' | 'url';
		placeholder?: string;
		ariaLabel?: string;
		id?: string;
		name?: string;
		size?: 'default' | 'sm';
		icon?: Component;
		class?: string;
		oninput?: (e: Event & { currentTarget: HTMLInputElement }) => void;
		onkeydown?: (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => void;
	}

	let {
		value = $bindable(''),
		type = 'text',
		placeholder,
		ariaLabel,
		id,
		name,
		size = 'default',
		icon: IconComponent,
		class: className = '',
		oninput,
		onkeydown
	}: Props = $props();
</script>

<div class="sh-input-wrap size-{size} {className}" class:has-icon={!!IconComponent}>
	{#if IconComponent}
		<span class="sh-input-icon" aria-hidden="true">
			<IconComponent />
		</span>
	{/if}
	<input
		{id}
		{name}
		{type}
		{placeholder}
		aria-label={ariaLabel ?? placeholder}
		bind:value
		{oninput}
		{onkeydown}
		class="sh-input"
	/>
</div>

<style>
	.sh-input-wrap {
		position: relative;
		display: inline-flex;
		align-items: center;
		width: 100%;
	}

	.sh-input-icon {
		position: absolute;
		left: var(--ax-space-10);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--muted-foreground);
		font-size: var(--sh-font-size-sm);
		pointer-events: none;
	}

	.sh-input {
		width: 100%;
		height: var(--ax-space-36);
		padding: 0 var(--ax-space-12);
		border-radius: var(--radius-sm);
		border: var(--sh-border-width) solid var(--input);
		background-color: var(--card);
		color: var(--foreground);
		font-family: inherit;
		font-size: var(--sh-font-size-sm);
		line-height: var(--ax-space-20);
		box-shadow: var(--sh-shadow-xs);
		transition:
			border-color 120ms ease,
			box-shadow 120ms ease;
		box-sizing: border-box;
	}

	.sh-input-wrap.size-sm .sh-input {
		height: var(--ax-space-32);
	}

	.sh-input-wrap.has-icon .sh-input {
		padding-left: var(--ax-space-32);
	}

	.sh-input::placeholder {
		color: var(--muted-foreground);
	}

	.sh-input:focus {
		outline: none;
		border-color: var(--ring);
		box-shadow: 0 0 0 var(--ax-space-2) color-mix(in srgb, var(--ring) 18%, transparent);
	}
</style>
