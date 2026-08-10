<script lang="ts" generics="T extends Field, M extends FormMode = 'create'">
	import { enhance } from '$app/forms';
	import {
		Button,
		ErrorMessage,
		ErrorSummary,
		ErrorSummaryItem,
		Fieldset,
		ReadMore
	} from '@nais/ds-svelte-community';
	import type { ActionResult } from '@sveltejs/kit';
	import { tick, type Snippet } from 'svelte';
	import type { $ZodIssue } from 'zod/v4/core';
	import {
		activeFields,
		buildSections,
		CHECKBOX_ON,
		collectFormData,
		fieldId,
		flattenFields,
		getValue,
		issueKey,
		normalizeValues,
		repeatDefaults,
		resolveField,
		zodSchema,
		type DefaultValues,
		type Field,
		type FormMode,
		type FormProps,
		type FormValues,
		type GroupConfig,
		type Option,
		type OptionsOverrides,
		type RequiredOptionsOverrides,
		type SchemaRefinement
	} from './form';
	import FormField from './FormField.svelte';
	import RepeatField from './RepeatField.svelte';

	type Props<T extends Field, M extends FormMode = 'create'> = {
		fields: readonly T[];
		form: FormProps<T> | null;
		groups?: readonly GroupConfig[];
		defaultValues?: DefaultValues<T>;
		action?: string;
		size?: 'small' | 'medium';
		/** Rendered at the end of the form, above the submit button. */
		children?: Snippet<[FormValues<T>]>;
		/** Rendered directly below the named field, for content that belongs next to it. */
		after?: Partial<Record<T['name'], Snippet<[FormValues<T>]>>>;
		button?: Snippet<[{ submitting: boolean }]> | string;
		/** Rendered next to the submit button, for secondary actions like Cancel. */
		actions?: Snippet<[{ submitting: boolean }]>;
		mode?: M;
		errorHeading?: string;
		/** Cross-field constraints. Must match the `refine` the action passes to `validateForm`. */
		refine?: SchemaRefinement<readonly T[]>;
		/**
		 * Called with the result of every submit. Use it for outcomes the form itself can't express,
		 * e.g. revealing a generated secret or swapping the form for a success message.
		 */
		onresult?: (result: ActionResult) => void;
	} & (object extends RequiredOptionsOverrides<T, M>
		? { optionsOverrides?: OptionsOverrides<T, M> }
		: { optionsOverrides: OptionsOverrides<T, M> });

	let {
		action,
		fields,
		groups = [],
		form,
		defaultValues,
		optionsOverrides,
		size = 'small',
		children,
		after,
		button = 'Submit',
		actions,
		mode = 'create' as M,
		errorHeading = 'Please correct the following before continuing',
		refine,
		onresult
	}: Props<T, M> = $props();

	const formId = $props.id();

	// Two passes: mode decides which fields exist at all, and their values then decide which of
	// those a `dynamic` condition hides.
	const modeFields = $derived(activeFields(fields, mode));
	const overrides = $derived(optionsOverrides as Record<string, readonly Option[]> | undefined);

	// Values submitted back by the server win over the declared defaults, so a failed submit keeps
	// what the user typed. `edited` holds the client-side state and is cleared on every submit so
	// the server response becomes authoritative again.
	const serverValues = $derived(
		Object.assign(
			{},
			...modeFields.map((f) => {
				const declared = defaultValues?.[f.name as keyof DefaultValues<T>];

				// A repeated group has one entry per row and column rather than a single value.
				return f.type === 'repeat'
					? repeatDefaults(f, form, declared as readonly Record<string, string | number>[])
					: { [f.name]: getValue(form, f.name, declared as string | number | boolean | undefined) };
			})
		) as Record<string, string>
	);

	let edited = $state<Record<string, string> | null>(null);
	// The field the user is typing in, so normalization can leave it alone.
	let editing = $state<string | undefined>(undefined);

	const currentValues = $derived(edited ?? serverValues);
	const values = $derived(
		normalizeValues(
			flattenFields(modeFields, currentValues),
			currentValues,
			overrides,
			editing
		) as FormValues<T>
	);

	const shownFields = $derived(activeFields(modeFields, mode, values));
	const sections = $derived(buildSections(shownFields, groups));
	// Repeated groups stand in for one control per row and column, and it is those the values,
	// error links and the schema are keyed by.
	const renderedFields = $derived(flattenFields(shownFields, values));

	function handleValueChange(event: Event) {
		const target = event.target as
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
		if (!target?.name) return;

		const next: Record<string, string> = { ...values };
		next[target.name] =
			target instanceof HTMLInputElement && target.type === 'checkbox'
				? target.checked
					? CHECKBOX_ON
					: ''
				: target.value;

		edited = next;
		editing = target.name;
	}

	const shownFieldNames = $derived(new Set<string>(renderedFields.map((f) => f.name)));

	// Validating on the client with the very same schema the action uses means the error summary
	// is reachable without a round trip, while the server stays the authority. Client issues are
	// dropped as soon as a submit gets through to the server.
	let clientIssues = $state<$ZodIssue[]>([]);
	const issues = $derived(clientIssues.length > 0 ? clientIssues : (form?.errors ?? []));

	// `['env', 0, 'name']` is the control named `env.0.name`, so the whole path identifies it.
	const issueField = (issue: $ZodIssue) =>
		issue.path.length > 0 ? issueKey(issue.path) : undefined;
	const isLinked = (issue: $ZodIssue) => {
		const name = issueField(issue);
		return name !== undefined && shownFieldNames.has(name);
	};

	// A control has room for one message, and the API can return several for the same field
	// ("must not be empty" *and* "must match the pattern"). First wins: it is the more fundamental
	// one, and it is the one a user has to fix first anyway.
	const fieldErrors = $derived(
		new Map(
			issues
				.filter(isLinked)
				.map((issue) => [issueField(issue)!, issue.message] as const)
				.filter(([name], index, all) => all.findIndex(([n]) => n === name) === index)
		)
	);

	// Issues that can't be pinned to a visible control — form-level refinements, or a field that is
	// hidden in this mode — would otherwise fail the submit without telling the user anything.
	const unlinkedErrors = $derived(
		issues.filter((issue) => !isLinked(issue)).map((issue) => issue.message)
	);

	const errorItems = $derived(
		renderedFields
			.filter((f) => fieldErrors.has(f.name))
			.map((f) => ({ name: f.name, message: fieldErrors.get(f.name)! }))
	);

	const formError = $derived(clientIssues.length > 0 ? undefined : form?.error);

	let errorEl: HTMLDivElement | undefined = $state();
	let submitting = $state(false);

	async function focusErrors() {
		await tick();
		errorEl?.focus();
	}

	/** Moves focus to the control itself rather than the wrapper the summary has to link to. */
	function focusField(event: MouseEvent, name: string) {
		const target = document.getElementById(fieldId(formId, name));
		const control = target?.matches('input, select, textarea')
			? target
			: target?.querySelector<HTMLElement>('input, select, textarea');

		if (control) {
			event.preventDefault();
			control.focus();
		}
	}
</script>

<form
	{action}
	method="post"
	novalidate
	oninput={handleValueChange}
	onchange={handleValueChange}
	use:enhance={async ({ formData, cancel }) => {
		// A custom button snippet, or a second Enter press, can submit again while the first
		// submit is still in flight.
		if (submitting) {
			cancel();
			return;
		}

		// The browser's own validation is turned off so that every message comes from the schema
		// and lands in the error summary, where it can be read and linked to. Parsing is async to
		// match the action, so a schema with an async refinement behaves the same on both sides.
		const data = Object.fromEntries(
			Array.from(formData, ([key, value]) => [key, typeof value === 'string' ? value : ''])
		);
		const parsed = await zodSchema(shownFields, refine, data).safeParseAsync(
			collectFormData(shownFields, data)
		);

		if (!parsed.success) {
			clientIssues = parsed.error.issues;
			cancel();
			await focusErrors();
			return;
		}

		clientIssues = [];
		submitting = true;

		return async ({ result, update }) => {
			edited = null;
			editing = undefined;
			submitting = false;
			await update({ reset: false });
			onresult?.(result);
			if (result.type === 'failure') {
				await focusErrors();
			}
		};
	}}
>
	{#if formError || errorItems.length > 0 || unlinkedErrors.length > 0}
		<div class="errors" bind:this={errorEl} tabindex="-1">
			{#if errorItems.length > 0}
				<ErrorSummary {size} heading={errorHeading}>
					{#each errorItems as item (item.name)}
						<ErrorSummaryItem
							href="#{fieldId(formId, item.name)}"
							onclick={(event: MouseEvent) => focusField(event, item.name)}
						>
							{item.message}
						</ErrorSummaryItem>
					{/each}
				</ErrorSummary>
			{/if}
			{#each unlinkedErrors as message, index (index)}
				<ErrorMessage {size}>{message}</ErrorMessage>
			{/each}
			{#if formError}
				<ErrorMessage {size}>{formError}</ErrorMessage>
			{/if}
		</div>
	{/if}

	{#snippet renderFields(sectionFields: T[])}
		{#each sectionFields as field (field.name)}
			{#if field.type === 'repeat'}
				<RepeatField
					{field}
					{formId}
					{size}
					values={values as Record<string, string>}
					errors={fieldErrors}
					optionsOverrides={overrides}
					onchange={(next) => {
						edited = next;
						editing = undefined;
					}}
				/>
			{:else}
				<FormField
					field={resolveField(field, values, overrides)}
					id={fieldId(formId, field.name)}
					value={values[field.name as keyof FormValues<T>]}
					error={fieldErrors.get(field.name)}
					{size}
				/>
			{/if}
			{@render after?.[field.name as keyof typeof after]?.(values)}
		{/each}
	{/snippet}

	{#each sections as section, index (section.kind === 'group' ? section.group.name : index)}
		{#if section.kind === 'fields'}
			{@render renderFields(section.fields)}
		{:else if section.group.collapsible}
			<ReadMore header={section.group.label} {size}>
				<div class="group">
					{@render renderFields(section.fields)}
				</div>
			</ReadMore>
		{:else}
			<Fieldset legend={section.group.label} {size}>
				{@render renderFields(section.fields)}
			</Fieldset>
		{/if}
	{/each}

	{@render children?.(values)}

	<div class="actions">
		{#if typeof button === 'string'}
			<Button type="submit" variant="primary" {size} loading={submitting}>{button}</Button>
		{:else}
			{@render button({ submitting })}
		{/if}
		{@render actions?.({ submitting })}
	</div>
</form>

<style>
	form,
	.group {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		align-items: flex-start;
	}

	.actions {
		display: flex;
		gap: var(--ax-space-8);
		align-items: center;
		flex-wrap: wrap;
	}

	.errors {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		align-self: stretch;
	}

	.errors:focus {
		outline: none;
	}
</style>
