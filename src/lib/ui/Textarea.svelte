<script lang="ts">
	const uid = $props.id();

	interface Props {
		text: string | undefined;
		id?: string;
		label?: string;
		description?: string;
		readonly?: boolean;
		rows?: number;
		cols?: number;
	}

	let {
		text = $bindable(),
		id = uid,
		label = '',
		description = '',
		readonly = false,
		rows = 5,
		cols = 40
	}: Props = $props();
</script>

<div class="sh-ui-field">
	{#if label}
		<label class="field-label" for={id}>
			{label}
		</label>
	{/if}
	{#if description}
		<div class="field-description">
			<i>{description}</i>
		</div>
	{/if}
	<textarea class="textarea" {id} {rows} {cols} bind:value={text} {readonly}></textarea>
</div>

<style>
	.sh-ui-field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}
	.field-label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--foreground);
	}
	.field-description {
		font-size: 0.75rem;
		color: var(--muted-foreground);
	}
	.textarea {
		resize: vertical;
		min-height: 2rem;
		width: 100%;
		padding: 0.5rem 0.75rem;
		border-radius: calc(var(--radius) - 2px);
		border: 1px solid var(--input);
		background-color: var(--background);
		color: var(--foreground);
		font-family: monospace;
		font-size: var(--ax-font-size-small);
		line-height: 1.45;
		box-sizing: border-box;
	}
	.textarea:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 1px;
		border-color: var(--ring);
	}
</style>
