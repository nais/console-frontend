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
		gap: var(--nais-space-6);
	}
	.sh-form-field__description {
		font-size: var(--sh-font-size-xs);
		color: var(--muted-foreground);
		line-height: 1.4;
	}
	.sh-input-control {
		width: 100%;
		box-sizing: border-box;
		border-radius: var(--radius-sm);
		border: var(--sh-border-width) solid var(--input);
		background-color: var(--card);
		color: var(--foreground);
		padding: 0 var(--nais-space-12);
		font-family: inherit;
		font-size: var(--sh-font-size-sm);
		height: var(--nais-space-36);
		box-shadow: var(--sh-shadow-xs);
		transition:
			border-color 120ms ease,
			box-shadow 120ms ease;
	}
	.sh-input-control--small {
		height: var(--nais-space-32);
		padding: 0 var(--nais-space-10);
		font-size: var(--sh-font-size-sm);
	}
	.sh-input-control:focus-visible {
		outline: none;
		border-color: var(--ring);
		box-shadow: 0 0 0 var(--nais-space-2) color-mix(in srgb, var(--ring) 22%, transparent);
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
