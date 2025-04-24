<script lang="ts">
	interface Props {
		text: string | undefined;
		label?: string;
		description?: string;
		readonly?: boolean;
		rows?: number;
		cols?: number;
	}

	let {
		text = $bindable(),
		label = '',
		description = '',
		readonly = false,
		rows = 5,
		cols = 40
	}: Props = $props();
</script>

<div class="aksel-form-field">
	{#if label}
		<label class="aksel-form-field__label aksel-label aksel-label--small" for="value">
			{label}
		</label>
	{/if}
	{#if description}
		<div class="aksel-form-field__description aksel-detail">
			<i>{description}</i>
		</div>
	{/if}
	<textarea
		class="aksel-textarea__input aksel-body-short aksel-body-short--small textarea"
		id="value"
		{rows}
		{cols}
		bind:value={text}
		{readonly}
	></textarea>
</div>

<style>
	.textarea {
		resize: vertical;
		min-height: 2rem;
		font-family: monospace;
		font-size: var(--ax-font-size-small, --a-font-size-small);
	}
</style>
