<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import ErrorMessage from './ErrorMessage.svelte';
	import Label from './Label.svelte';

	interface Props extends Omit<HTMLTextareaAttributes, 'size'> {
		value?: string;
		hideLabel?: boolean;
		error?: string;
		errorId?: string;
		size?: 'medium' | 'small';
		id?: string;
		label: string | Snippet;
		description?: string | Snippet;
		maxRows?: number;
		minRows?: number;
		resize?: boolean | 'vertical' | 'horizontal';
		[key: string]: unknown;
	}

	const uid = $props.id();

	let {
		value = $bindable(),
		id = `ta-${uid}`,
		hideLabel = false,
		error = '',
		errorId = `ta-err-${uid}`,
		size = 'medium',
		label,
		description,
		rows = 4,
		class: className = '',
		...rest
	}: Props = $props();

	const descId = $derived(`ta-desc-${id}`);
</script>

<div class={['sh-form-field', className]}>
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

	<textarea
		{id}
		{rows}
		bind:value
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={description ? descId : undefined}
		class={['sh-textarea-control', `sh-textarea-control--${size}`, { 'has-error': Boolean(error) }]}
		{...rest}></textarea>

	{#if error}
		<div id={errorId} aria-live="polite">
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
	.sh-textarea-control {
		width: 100%;
		box-sizing: border-box;
		border-radius: var(--radius-sm);
		border: var(--sh-border-width) solid var(--input);
		background-color: var(--card);
		color: var(--foreground);
		padding: var(--nais-space-8) var(--nais-space-12);
		font-family: inherit;
		font-size: var(--sh-font-size-sm);
		line-height: 1.45;
		resize: vertical;
		box-shadow: var(--sh-shadow-xs);
	}
	.sh-textarea-control--small {
		font-size: var(--sh-font-size-sm);
		padding: var(--nais-space-6) var(--nais-space-10);
	}
	.sh-textarea-control:focus-visible {
		outline: none;
		border-color: var(--ring);
		box-shadow: 0 0 0 var(--nais-space-2) color-mix(in srgb, var(--ring) 22%, transparent);
	}
	.sh-textarea-control.has-error {
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
