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
		'aria-describedby': externalDescription,
		value = $bindable(),
		children,
		description,
		readonly = false,
		id = `sel-${uid}`,
		class: className = '',
		...rest
	}: Props = $props();
	let descriptionId = $derived(`${id}-description`);
	let errorId = $derived(`${id}-error`);
	let describedBy = $derived(
		[externalDescription, description ? descriptionId : undefined, error ? errorId : undefined]
			.filter(Boolean)
			.join(' ') || undefined
	);
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
		<div id={descriptionId} class={['sh-select-field__description', { 'sr-only': hideLabel }]}>
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
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={describedBy}
	>
		{@render children()}
	</select>

	{#if error}
		<div id={errorId} aria-live="polite"><ErrorMessage {size} showIcon>{error}</ErrorMessage></div>
	{/if}
</div>

<style>
	.sh-select-field {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-6);
	}
	.sh-select-field__description {
		font-size: var(--sh-font-size-xs);
		color: var(--muted-foreground);
	}
	.sh-select-control {
		width: 100%;
		box-sizing: border-box;
		border-radius: var(--radius-sm);
		border: var(--sh-border-width) solid var(--input);
		background-color: var(--card);
		color: var(--foreground);
		padding: 0 var(--nais-space-32) 0 var(--nais-space-12);
		font-family: inherit;
		font-size: var(--sh-font-size-sm);
		height: var(--nais-space-36);
		box-shadow: var(--sh-shadow-xs);
		cursor: pointer;
	}
	.sh-select-control--small {
		height: var(--nais-space-32);
		padding: 0 var(--nais-space-28) 0 var(--nais-space-10);
		font-size: var(--sh-font-size-sm);
	}
	.sh-select-control:focus-visible {
		outline: none;
		border-color: var(--ring);
		box-shadow: 0 0 0 var(--nais-space-2) color-mix(in srgb, var(--ring) 22%, transparent);
	}
	.sh-select-control:disabled {
		opacity: 0.6;
		background-color: var(--muted);
		cursor: not-allowed;
	}
	.sr-only {
		position: absolute;
		width: var(--nais-space-1);
		height: var(--nais-space-1);
		padding: 0;
		margin: calc(-1 * var(--nais-space-1));
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
