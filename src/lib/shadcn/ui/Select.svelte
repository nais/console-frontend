<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import ErrorMessage from './ErrorMessage.svelte';
	import Label from './Label.svelte';

	interface Props extends Omit<HTMLSelectAttributes, 'size'> {
		label: string | Snippet;
		hideLabel?: boolean;
		style?: string;
		size?: 'medium' | 'small';
		disabled?: boolean;
		error?: string;
		value?: unknown;
		children: Snippet;
		description?: Snippet | string;
		readonly?: boolean;
		readOnlyIconText?: string;
		id?: string;
		[key: string]: unknown;
	}

	const uid = $props.id();

	let {
		label,
		hideLabel = false,
		style,
		size = 'medium',
		disabled = false,
		error,
		value = $bindable(),
		children,
		description,
		readonly = false,
		id = `sel-${uid}`,
		class: className = '',
		...rest
	}: Props = $props();
</script>

<div class={['sh-select-field', className]} {style}>
	<Label for={id} {size} visuallyHidden={hideLabel}>
		{#if typeof label === 'string'}
			{label}
		{:else}
			{@render label()}
		{/if}
	</Label>

	{#if description}
		<div class="sh-select-field__description" class:sr-only={hideLabel}>
			{#if typeof description === 'string'}
				{description}
			{:else}
				{@render description()}
			{/if}
		</div>
	{/if}

	<select
		{id}
		disabled={disabled || readonly}
		bind:value
		class={['sh-select-control', `sh-select-control--${size}`, { 'has-error': Boolean(error) }]}
		{...rest}
	>
		{@render children()}
	</select>

	{#if error}
		<ErrorMessage {size} showIcon>{error}</ErrorMessage>
	{/if}
</div>

<style>
	.sh-select-field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.sh-select-field__description {
		font-size: 0.75rem;
		color: var(--muted-foreground);
	}
	.sh-select-control {
		width: 100%;
		box-sizing: border-box;
		border-radius: calc(var(--radius) - 2px);
		border: 1px solid var(--input);
		background-color: var(--card);
		color: var(--foreground);
		padding: 0 2rem 0 0.75rem;
		font-family: inherit;
		font-size: 0.875rem;
		height: 2.25rem;
		box-shadow: var(--sh-shadow-xs);
		cursor: pointer;
	}
	.sh-select-control--small {
		height: 2rem;
		padding: 0 1.75rem 0 0.625rem;
		font-size: 0.8125rem;
	}
	.sh-select-control:focus-visible {
		outline: none;
		border-color: var(--ring);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--ring) 22%, transparent);
	}
	.sh-select-control:disabled {
		opacity: 0.6;
		background-color: var(--muted);
		cursor: not-allowed;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
