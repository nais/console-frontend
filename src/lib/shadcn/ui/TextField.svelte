<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import ErrorMessage from './ErrorMessage.svelte';
	import Label from './Label.svelte';

	interface Props extends Omit<HTMLInputAttributes, 'size'> {
		value?: unknown;
		htmlSize?: number;
		hideLabel?: boolean;
		error?: string;
		errorId?: string;
		size?: 'medium' | 'small';
		disabled?: boolean;
		id?: string;
		type?: Exclude<HTMLInputAttributes['type'], 'object'>;
		label: string | Snippet;
		description?: string | Snippet;
		[key: string]: unknown;
	}

	const uid = $props.id();

	let {
		value = $bindable(),
		id = `tf-${uid}`,
		hideLabel = false,
		type = 'text',
		error = '',
		errorId = `tf-err-${uid}`,
		size = 'medium',
		disabled = false,
		htmlSize,
		label,
		description,
		class: className = '',
		style,
		...rest
	}: Props = $props();

	const descId = $derived(`tf-desc-${id}`);
	const describedBy = $derived(
		[
			rest['aria-describedby'] as string | undefined,
			description ? descId : null,
			error ? errorId : null
		]
			.filter(Boolean)
			.join(' ') || undefined
	);
</script>

<div
	class={['sh-form-field', `sh-form-field--${size}`, className]}
	style={style as string | undefined}
>
	<Label for={id} {size} visuallyHidden={hideLabel}>
		{#if typeof label === 'string'}
			{label}
		{:else}
			{@render label()}
		{/if}
	</Label>

	{#if description}
		<div id={descId} class="sh-form-field__description" class:sr-only={hideLabel}>
			{#if typeof description === 'string'}
				{description}
			{:else}
				{@render description()}
			{/if}
		</div>
	{/if}

	<input
		{type}
		{id}
		{disabled}
		size={htmlSize}
		bind:value
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={describedBy}
		class={['sh-input-control', `sh-input-control--${size}`, { 'has-error': Boolean(error) }]}
		{...rest}
	/>

	{#if error}
		<div id={errorId} class="sh-form-field__error" aria-live="polite">
			<ErrorMessage {size} showIcon>{error}</ErrorMessage>
		</div>
	{/if}
</div>

<style>
	.sh-form-field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.sh-form-field__description {
		font-size: 0.75rem;
		color: var(--muted-foreground);
		line-height: 1.4;
	}
	.sh-input-control {
		width: 100%;
		box-sizing: border-box;
		border-radius: calc(var(--radius) - 2px);
		border: 1px solid var(--input);
		background-color: var(--card);
		color: var(--foreground);
		padding: 0 0.75rem;
		font-family: inherit;
		font-size: 0.875rem;
		height: 2.25rem;
		box-shadow: var(--sh-shadow-xs);
		transition:
			border-color 120ms ease,
			box-shadow 120ms ease;
	}
	.sh-input-control--small {
		height: 2rem;
		padding: 0 0.625rem;
		font-size: 0.8125rem;
	}
	.sh-input-control:focus-visible {
		outline: none;
		border-color: var(--ring);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--ring) 22%, transparent);
	}
	.sh-input-control:disabled,
	.sh-input-control[readonly] {
		opacity: 0.6;
		background-color: var(--muted);
	}
	.sh-input-control.has-error {
		border-color: var(--destructive);
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
