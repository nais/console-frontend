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
		left: 0.625rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--muted-foreground);
		font-size: 0.875rem;
		pointer-events: none;
	}

	.sh-input {
		width: 100%;
		height: 2.25rem;
		padding: 0 0.75rem;
		border-radius: calc(var(--radius) - 2px);
		border: 1px solid var(--input);
		background-color: var(--card);
		color: var(--foreground);
		font-family: inherit;
		font-size: 0.8125rem;
		line-height: 1.25rem;
		box-shadow: var(--sh-shadow-xs);
		transition:
			border-color 120ms ease,
			box-shadow 120ms ease;
		box-sizing: border-box;
	}

	.sh-input-wrap.size-sm .sh-input {
		height: 2rem;
	}

	.sh-input-wrap.has-icon .sh-input {
		padding-left: 2rem;
	}

	.sh-input::placeholder {
		color: var(--muted-foreground);
	}

	.sh-input:focus {
		outline: none;
		border-color: var(--ring);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--ring) 18%, transparent);
	}
</style>
