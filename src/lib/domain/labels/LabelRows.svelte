<script lang="ts">
	import { Button, TextField } from '@nais/ds-svelte-community';
	import { PlusIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import { duplicateLabelKeys, rowKeyError, rowValueError, type LabelRow } from './labels';

	let { rows = $bindable() }: { rows: LabelRow[] } = $props();

	let duplicates = $derived(duplicateLabelKeys(rows));

	const keyInputStyle = `font-family: monospace; font-size: var(--ax-font-size-small); padding-left: var(--ax-space-12);`;

	function addRow() {
		rows.push({ key: '', value: '' });
	}

	function removeRow(index: number) {
		rows.splice(index, 1);
		if (rows.length === 0) {
			rows.push({ key: '', value: '' });
		}
	}
</script>

<div class="editor">
	{#each rows as row, i (i)}
		<div class="label-row">
			<div class="key-field">
				<TextField
					size="small"
					label="Label key"
					hideLabel
					name="label_key"
					placeholder="key"
					style={keyInputStyle}
					bind:value={row.key}
					error={rowKeyError(row, duplicates)}
				/>
			</div>
			<div class="value-field">
				<TextField
					size="small"
					label="Label value"
					hideLabel
					name="label_value"
					placeholder="value"
					bind:value={row.value}
					error={rowValueError(row)}
				/>
			</div>
			{#if rows.length > 1}
				<Button
					size="small"
					variant="tertiary-neutral"
					icon={TrashIcon}
					title="Remove label"
					type="button"
					onclick={() => removeRow(i)}
				/>
			{/if}
		</div>
	{/each}

	<div>
		<Button size="small" variant="secondary" icon={PlusIcon} type="button" onclick={addRow}>
			Add label
		</Button>
	</div>
</div>

<style>
	.editor {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}

	.label-row {
		display: flex;
		gap: var(--ax-space-8);
		align-items: flex-start;
	}

	.key-field,
	.value-field {
		flex: 1;
		min-width: 0;
	}

	.key-field {
		position: relative;
	}

	@media (max-width: 600px) {
		.label-row {
			flex-wrap: wrap;
		}

		.key-field,
		.value-field {
			flex-basis: 100%;
		}
	}
</style>
