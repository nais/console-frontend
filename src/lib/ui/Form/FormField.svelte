<script lang="ts">
	import {
		Checkbox,
		ErrorMessage,
		Radio,
		RadioGroup,
		Select,
		TextField
	} from '@nais/ds-svelte-community';
	import Textarea from '../Textarea.svelte';
	import { CHECKBOX_ON, type Field } from './form';

	type Props = {
		field: Field;
		id: string;
		value: string;
		error?: string;
		size?: 'small' | 'medium';
	};

	const { field, id, value, error, size = 'small' }: Props = $props();

	// Select generates its own control id, so the error summary has to link to the wrapper
	// instead. Every other control accepts the id we pass it.
	const usesWrapperId = $derived(field.type === 'select');

	const common = $derived({
		name: field.name,
		id: usesWrapperId ? undefined : id,
		...field.inputProps
	});

	const options = $derived('options' in field ? (field.options ?? []) : []);
	const hasDescription = $derived(field.description !== undefined);
</script>

{#snippet description()}
	{#if typeof field.description === 'string'}
		{field.description}
	{:else if field.description}
		{@render field.description()}
	{/if}
{/snippet}

{#if field.type === 'hidden'}
	<input type="hidden" name={field.name} {value} />
{:else}
	<!--
	The wrapper is only made focusable for selects, so that the error summary has something to
	link to. svelte can't tell the tabindex is always negative here.
-->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="field"
		id={usesWrapperId ? id : undefined}
		tabindex={usesWrapperId ? -1 : undefined}
		style:--field-width={field.characterWidth ? `${field.characterWidth}ch` : null}
	>
		{#if field.type === 'select'}
			<Select
				{...common}
				hideLabel={field.hideLabel}
				{size}
				{value}
				{error}
				label={field.label}
				description={hasDescription ? description : undefined}
			>
				{#each options as option (option.value)}
					<option value={option.value}>{option.label ?? option.value}</option>
				{/each}
			</Select>
		{:else if field.type === 'checkbox'}
			<!-- Unchecked boxes are left out of the form data, so this guarantees a submitted value. -->
			<input type="hidden" name={field.name} value="" />
			<Checkbox
				{...common}
				{size}
				error={error !== undefined}
				value={CHECKBOX_ON}
				checked={value === CHECKBOX_ON}
				description={hasDescription ? description : undefined}
			>
				{field.label}
			</Checkbox>
			{#if error}
				<ErrorMessage {size}>{error}</ErrorMessage>
			{/if}
		{:else if field.type === 'radio'}
			<!--
			RadioGroup spreads unknown props onto its fieldset and hardcodes `required: false` on the
			context each Radio reads, so `required` has to go on the inputs themselves.
		-->
			<RadioGroup
				{...common}
				{size}
				{value}
				{error}
				tabindex={-1}
				legend={field.label}
				description={hasDescription ? description : undefined}
			>
				{#each options as option (option.value)}
					<Radio value={option.value} required={field.inputProps?.required}>
						{option.label ?? option.value}
					</Radio>
				{/each}
			</RadioGroup>
		{:else if field.type === 'textarea'}
			<Textarea
				{...common}
				hideLabel={field.hideLabel}
				{size}
				{error}
				text={value}
				label={field.label}
				rows={field.rows ?? 3}
				cols={field.characterWidth}
				description={hasDescription ? description : undefined}
			/>
		{:else}
			<TextField
				{...common}
				hideLabel={field.hideLabel}
				{size}
				{value}
				{error}
				label={field.label}
				type={field.type}
				htmlSize={field.characterWidth}
				description={hasDescription ? description : undefined}
			/>
		{/if}
	</div>
{/if}

<style>
	/*
	 * Inputs and textareas size themselves in characters natively (size/cols), selects don't.
	 * Sizing the select in ch gives all three the same width for the same characterWidth.
	 */
	.field {
		--field-width: 20ch;
		max-width: 100%;
	}

	.field:focus {
		outline: none;
	}

	/*
	 * The chevron is absolutely positioned against the container, so the container is what has to
	 * be sized. Shrinking the select alone leaves the container full width and the chevron
	 * stranded at the far right of the row. The select's own padding and border are added back so
	 * --field-width keeps measuring the text area, the way size and cols do for the other controls.
	 */
	.field :global(.aksel-select__container) {
		width: calc(var(--field-width) + var(--ax-space-8) + var(--ax-space-40) + 2px);
		max-width: 100%;
	}
</style>
