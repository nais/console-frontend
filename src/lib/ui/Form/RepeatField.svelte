<script lang="ts">
	import { Button } from '@nais/ds-svelte-community';
	import { PlusIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import {
		fieldId,
		repeatRow,
		repeatRowCount,
		resolveField,
		rowFieldName,
		type Option,
		type RepeatFieldData
	} from './form';
	import FormField from './FormField.svelte';

	type Props = {
		field: RepeatFieldData;
		formId: string;
		values: Record<string, string>;
		errors: Map<string, string>;
		size?: 'small' | 'medium';
		optionsOverrides?: Record<string, readonly Option[] | undefined>;
		onchange: (values: Record<string, string>) => void;
	};

	const {
		field,
		formId,
		values,
		errors,
		size = 'small',
		optionsOverrides,
		onchange
	}: Props = $props();

	const minRows = $derived(field.minRows ?? 0);
	const rowCount = $derived(repeatRowCount(field, values));
	const rows = $derived(Array.from({ length: rowCount }, (_, index) => repeatRow(field, index)));

	const rowValues = (index: number) =>
		Object.fromEntries(
			field.fields.map((f) => {
				const name = rowFieldName(field.name, index, f.name);
				return [name, values[name] ?? ''];
			})
		);

	function addRow() {
		onchange({ ...values, ...rowValues(rowCount) });
	}

	// Rows are addressed by index, so removing one has to close the gap rather than leave a hole.
	function removeRow(removed: number) {
		const next: Record<string, string> = { ...values };

		for (let index = removed; index < rowCount; index++) {
			for (const rowField of field.fields) {
				delete next[rowFieldName(field.name, index, rowField.name)];
			}
		}

		for (let index = removed + 1; index < rowCount; index++) {
			for (const rowField of field.fields) {
				next[rowFieldName(field.name, index - 1, rowField.name)] =
					values[rowFieldName(field.name, index, rowField.name)] ?? '';
			}
		}

		onchange(next);
	}
</script>

<fieldset class="repeat">
	<legend class="aksel-label aksel-label--{size}">{field.label}</legend>

	{#each rows as row, index (index)}
		<div class="row">
			{#each row as rowField (rowField.name)}
				<div class="cell">
					<FormField
						field={resolveField(rowField, values, optionsOverrides)}
						id={fieldId(formId, rowField.name)}
						value={values[rowField.name] ?? ''}
						error={errors.get(rowField.name)}
						{size}
					/>
				</div>
			{/each}
			<div class="remove" class:first={index === 0}>
				{#if rowCount > minRows}
					<Button
						{size}
						type="button"
						variant="tertiary-neutral"
						icon={TrashIcon}
						title="Remove {field.label} entry {index + 1}"
						onclick={() => removeRow(index)}
					/>
				{/if}
			</div>
		</div>
	{/each}

	{#if field.maxRows === undefined || rowCount < field.maxRows}
		<div>
			<Button {size} type="button" variant="secondary" icon={PlusIcon} onclick={addRow}>
				{field.addLabel ?? `Add ${field.label.toLowerCase()}`}
			</Button>
		</div>
	{/if}
</fieldset>

<style>
	.repeat {
		border: none;
		padding: 0;
		margin: 0;
		min-inline-size: 0;
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}

	legend {
		padding: 0;
		margin-bottom: var(--ax-space-4);
	}

	.row {
		display: flex;
		gap: var(--ax-space-8);
		align-items: end;
	}

	.cell {
		flex: 1;
		min-width: 0;
	}

	/* Reserves the button column on the first row so the inputs above and below stay aligned. */
	.remove {
		flex: 0 0 auto;
		min-width: var(--ax-space-32);
	}

	@media (max-width: 767px) {
		.row {
			flex-wrap: wrap;
		}

		.cell {
			flex: 1 1 100%;
		}

		.remove.first {
			min-width: 0;
		}
	}
</style>
