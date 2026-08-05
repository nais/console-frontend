<script lang="ts">
	import { ErrorMessage } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';

	interface Props {
		text: string | undefined;
		id?: string;
		label?: string;
		description?: string | Snippet;
		readonly?: boolean;
		rows?: number;
		cols?: number;
		error?: string;
		size?: 'small' | 'medium';
		name?: string;
		required?: boolean;
		disabled?: boolean;
		placeholder?: string;
		autocomplete?: HTMLTextAreaElement['autocomplete'];
		/** Keeps the label for assistive tech but hides it visually. */
		hideLabel?: boolean;
	}

	const uid = $props.id();

	let {
		text = $bindable(),
		id = `ta-${uid}`,
		label = '',
		description = '',
		readonly = false,
		rows = 5,
		cols = 40,
		size = 'small',
		name = '',
		required = false,
		disabled = false,
		placeholder,
		autocomplete,
		hideLabel = false,
		error
	}: Props = $props();

	const descriptionID = `tadesc-${uid}`;
	const errorID = `taerr-${uid}`;

	const describedBy = $derived(
		[description ? descriptionID : null, error ? errorID : null].filter(Boolean).join(' ') ||
			undefined
	);
</script>

<div class="aksel-form-field">
	{#if label}
		<label
			class="aksel-form-field__label aksel-label aksel-label--{size}"
			class:aksel-sr-only={hideLabel}
			for={id}
		>
			{label}
		</label>
	{/if}
	{#if description}
		<div
			class="aksel-form-field__description aksel-detail"
			class:aksel-sr-only={hideLabel}
			id={descriptionID}
		>
			{#if typeof description === 'string'}
				<i>{description}</i>
			{:else}
				{@render description()}
			{/if}
		</div>
	{/if}
	<textarea
		{name}
		class="aksel-textarea__input aksel-body-short aksel-body-short--{size} textarea"
		{id}
		{rows}
		{cols}
		{required}
		{disabled}
		{placeholder}
		{autocomplete}
		aria-describedby={describedBy}
		aria-invalid={error ? 'true' : undefined}
		bind:value={text}
		{readonly}></textarea>

	{#if error}
		<div id={errorID}>
			<ErrorMessage {size}>{error}</ErrorMessage>
		</div>
	{/if}
</div>

<style>
	.textarea {
		resize: vertical;
		min-height: 2rem;
		font-family: monospace;
		font-size: var(--ax-font-size-small);
		max-width: 100%;
	}
</style>
