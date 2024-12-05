<script lang="ts">
	export let text: string | undefined;
	export let label: string = '';
	export let description: string = '';
	export let readonly: boolean = false;
	export let rows = 5;
	export let cols = 40;
</script>

<div class="navds-form-field">
	{#if label}
		<label class="navds-form-field__label navds-label navds-label--small" for="value">
			{label}
		</label>
	{/if}
	{#if description}
		<div class="navds-form-field__description navds-detail">
			<i>{description}</i>
		</div>
	{/if}
	<textarea
		class="navds-textarea__input navds-body-short navds-body-short--small textarea"
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
		font-size: var(--a-font-size-small);
	}
</style>
