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
		gap: var(--ax-space-6);
	}
	.field-label {
		font-size: var(--sh-font-size-sm);
		font-weight: var(--sh-font-weight-medium);
		color: var(--foreground);
	}
	.field-description {
		font-size: var(--sh-font-size-xs);
		color: var(--muted-foreground);
	}
	.textarea {
		resize: vertical;
		min-height: var(--ax-space-32);
		width: 100%;
		padding: var(--ax-space-8) var(--ax-space-12);
		border-radius: var(--radius-sm);
		border: var(--sh-border-width) solid var(--input);
		background-color: var(--background);
		color: var(--foreground);
		font-family: monospace;
		font-size: var(--sh-font-size-sm);
		line-height: 1.45;
		box-sizing: border-box;
	}
	.textarea:focus-visible {
		outline: var(--ax-space-2) solid var(--ring);
		outline-offset: var(--ax-space-1);
		border-color: var(--ring);
	}
</style>
