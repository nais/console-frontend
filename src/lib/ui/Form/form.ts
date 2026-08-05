import type { Snippet } from 'svelte';
import * as z from 'zod';
import type { $ZodType as ZodValidation } from 'zod/v4/core';

export type FormMode = 'create' | 'edit';

export type Option = { readonly value: string; readonly label?: string };

export type FieldInputProps = {
	readonly required?: boolean;
	readonly disabled?: boolean;
	readonly readonly?: boolean;
	readonly autocomplete?: HTMLInputElement['autocomplete'];
	readonly placeholder?: string;
	readonly min?: string | number;
	readonly max?: string | number;
	readonly step?: string | number;
};

/** The current value of every rendered field, keyed by field name. */
export type FormValues<T extends Field = Field> = { [K in T['name']]: string };

/** Field properties that depend on the values of other fields. Merged over the static ones. */
export type DynamicFieldProps = {
	readonly description?: string | Snippet;
	readonly options?: readonly Option[];
	readonly inputProps?: FieldInputProps;
	/** Drops the field from the form and from validation while the condition holds. */
	readonly hidden?: boolean;
};

type BaseFieldData = {
	readonly name: string;
	/** Optional only because hidden fields render nothing; every visible field requires it. */
	readonly label?: string;
	readonly description?: string | Snippet;
	/** Visible width of the control, in characters. */
	readonly characterWidth?: number;
	/** Optional only because a repeated group derives its schema from the fields in a row. */
	readonly validation?: ZodValidation;
	/** Renders inside the group with this name, at the position of the group's first field. */
	readonly group?: string;
	/** Hidden and left out of validation in `edit` mode. */
	readonly createOnly?: boolean;
	/** Hidden and left out of validation in `create` mode. */
	readonly editOnly?: boolean;
	readonly inputProps?: FieldInputProps;
	readonly dynamic?: (values: Record<string, string>) => DynamicFieldProps;
	/** Keeps the label for assistive tech but hides it visually, e.g. on repeated rows. */
	readonly hideLabel?: boolean;
};

type VisibleFieldData = BaseFieldData & {
	readonly label: string;
	readonly validation: ZodValidation;
};

export type TextFieldData = VisibleFieldData & {
	readonly type: 'text' | 'number' | 'email' | 'password' | 'date' | 'url' | 'tel' | 'search';
};

export type TextAreaData = VisibleFieldData & {
	readonly type: 'textarea';
	readonly rows?: number;
};

export type SelectFieldData = VisibleFieldData & {
	readonly type: 'select';
	readonly options?: readonly Option[];
};

export type CheckboxFieldData = VisibleFieldData & {
	readonly type: 'checkbox';
};

export type RadioFieldData = VisibleFieldData & {
	readonly type: 'radio';
	readonly options?: readonly Option[];
};

/** Submitted with the form but never shown, e.g. a value carried through from the server. */
export type HiddenFieldData = BaseFieldData & {
	readonly type: 'hidden';
	readonly validation: ZodValidation;
};

/** The field types that can make up one row of a repeated group. Rows cannot nest. */
export type RowField =
	TextFieldData | TextAreaData | SelectFieldData | CheckboxFieldData | HiddenFieldData;

/**
 * A set of fields the user can repeat, e.g. a list of environment variables. Validates as an array
 * of row objects, so the action receives `name: [{ ... }, { ... }]` rather than parallel lists.
 */
export type RepeatFieldData = BaseFieldData & {
	readonly type: 'repeat';
	readonly label: string;
	/** The fields making up a single row. */
	readonly fields: readonly RowField[];
	readonly addLabel?: string;
	readonly removeLabel?: string;
	/**
	 * The fewest rows the group may hold. Enforced by the schema and by hiding the remove button,
	 * and the group starts with this many rows. Defaults to 0, i.e. the group may be emptied.
	 */
	readonly minRows?: number;
	readonly maxRows?: number;
};

export type Field =
	| TextFieldData
	| TextAreaData
	| SelectFieldData
	| CheckboxFieldData
	| RadioFieldData
	| HiddenFieldData
	| RepeatFieldData;

export type Fields = readonly Field[];

/** Submitted value of a checked checkbox. Unchecked boxes submit an empty string. */
export const CHECKBOX_ON = 'true';

/**
 * Rows are submitted under indexed names so a flat `FormData` can be read back as an array, and so
 * a zod issue path like `['env', 0, 'name']` joins straight onto the control it belongs to.
 */
export const rowFieldName = (group: string, index: number, field: string) =>
	`${group}.${index}.${field}`;

/** The key an issue points at, matching the `name` of the control that produced the value. */
export const issueKey = (path: readonly PropertyKey[]) => path.map(String).join('.');

const rowIndexes = (group: string, values: Record<string, string>): number[] => {
	const seen = new Set<number>();
	const prefix = `${group}.`;

	for (const key of Object.keys(values)) {
		if (!key.startsWith(prefix)) continue;
		const index = Number(key.slice(prefix.length).split('.')[0]);
		if (Number.isInteger(index) && index >= 0) seen.add(index);
	}

	return [...seen].sort((a, b) => a - b);
};

/** How many rows of a repeated group the given values describe, respecting `minRows`. */
export const repeatRowCount = (field: RepeatFieldData, values: Record<string, string>): number =>
	Math.max(rowIndexes(field.name, values).length, field.minRows ?? 0);

/**
 * One row of a repeated group as concrete fields, so rendering, normalization and error linking can
 * treat them like any other field.
 */
export function repeatRow(field: RepeatFieldData, index: number): RowField[] {
	return field.fields.map((rowField) => ({
		...rowField,
		name: rowFieldName(field.name, index, rowField.name),
		// Repeating the same labels down the page is noise; the first row labels the column.
		hideLabel: index > 0
	}));
}

/** Every field the form actually renders, with repeated groups expanded into their rows. */
export function flattenFields<T extends Field>(
	fields: readonly T[],
	values: Record<string, string>
): Field[] {
	return fields.flatMap((field) =>
		field.type === 'repeat'
			? Array.from({ length: repeatRowCount(field, values) }, (_, i) => repeatRow(field, i)).flat()
			: [field as Field]
	);
}

/**
 * Turns the flat names a form submits into the shape the schema describes, so a repeated group
 * arrives as an array of rows rather than as `env.0.name` keys.
 */
export function collectFormData(
	fields: readonly Field[],
	values: Record<string, string>
): Record<string, unknown> {
	const collected: Record<string, unknown> = { ...values };

	for (const field of fields) {
		if (field.type !== 'repeat') continue;

		const rows = rowIndexes(field.name, values).map((index) =>
			Object.fromEntries(
				field.fields.map((rowField) => [
					rowField.name,
					values[rowFieldName(field.name, index, rowField.name)] ?? ''
				])
			)
		);

		for (const key of Object.keys(collected)) {
			if (key.startsWith(`${field.name}.`)) delete collected[key];
		}
		collected[field.name] = rows;
	}

	return collected;
}

export type GroupConfig = {
	readonly name: string;
	readonly label: string;
	readonly collapsible?: boolean;
};

/**
 * The fields that apply to a given mode. Used by both the form and the server action so the two
 * can never disagree about which fields exist. Pass `values` to also drop fields that a `dynamic`
 * condition hides, since a control that isn't rendered never submits anything.
 */
export function activeFields<T extends Field>(
	fields: readonly T[],
	mode: FormMode,
	values?: Record<string, string>
): T[] {
	return fields.filter((field) => {
		if (mode === 'edit' ? field.createOnly : field.editOnly) return false;
		if (values && field.dynamic?.(values).hidden) return false;
		return true;
	});
}

/**
 * Form data always arrives as strings, so each field type gets the coercion its schema expects.
 * Field definitions therefore only have to describe the constraints, not the wire format.
 *
 * The limits a field renders under are part of its contract, so they are validated rather than
 * left to the browser: `min`/`max` and the available options are enforced here, which also closes
 * them on the server, where no browser is involved at all. Pass fields through `resolveField`
 * first so the limits reflect the values the rest of the form actually has.
 */
function coerced(
	field: Exclude<Field, RepeatFieldData> & { readonly options?: readonly Option[] }
): ZodValidation {
	const validation = field.validation as z.ZodType;

	switch (field.type) {
		case 'number': {
			// An empty number input means "not provided", not 0.
			const schema = z.preprocess((v) => (v === '' ? undefined : v), validation);
			const min = Number(field.inputProps?.min);
			const max = Number(field.inputProps?.max);
			if (Number.isNaN(min) && Number.isNaN(max)) return schema;

			return schema.refine(
				(value) => {
					if (typeof value !== 'number' || Number.isNaN(value)) return true;
					if (!Number.isNaN(min) && value < min) return false;
					if (!Number.isNaN(max) && value > max) return false;
					return true;
				},
				{
					message: Number.isNaN(max)
						? `${field.label} must be at least ${min}`
						: Number.isNaN(min)
							? `${field.label} must be at most ${max}`
							: min === max
								? `${field.label} must be ${min}`
								: `${field.label} must be between ${min} and ${max}`
				}
			);
		}
		case 'checkbox':
			return z.preprocess((v) => v === CHECKBOX_ON, validation);
		case 'select':
		case 'radio': {
			const options = field.options;
			// Options are only known where they were resolved; without them there is nothing to check.
			if (!options?.length) return validation;

			return (validation as z.ZodType).refine((value) => options.some((o) => o.value === value), {
				message: `Select one of the available options for ${field.label}`
			});
		}
		default:
			return validation;
	}
}

type RowShape<F extends readonly RowField[]> = { [K in F[number] as K['name']]: K['validation'] };

// A repeated group has no validation of its own; its schema is the array of the rows it repeats.
type SchemaOf<K extends Field> = K extends { type: 'repeat'; fields: infer F }
	? F extends readonly RowField[]
		? z.ZodArray<z.ZodObject<RowShape<F>>>
		: never
	: K['validation'];

type ShapeOf<T extends Fields> = { [K in T[number] as K['name']]: SchemaOf<K> };

function repeatSchema(field: RepeatFieldData): ZodValidation {
	const shape: Record<string, ZodValidation> = {};
	for (const rowField of field.fields) {
		shape[rowField.name] = coerced(rowField);
	}

	let schema = z.array(z.object(shape as Record<string, z.ZodType>));
	const min = field.minRows ?? 0;
	if (min > 0) {
		schema = schema.min(min, {
			message: `${field.label} needs at least ${min} ${min === 1 ? 'entry' : 'entries'}`
		});
	}
	if (field.maxRows !== undefined) {
		schema = schema.max(field.maxRows, {
			message: `${field.label} allows at most ${field.maxRows} entries`
		});
	}

	return schema;
}

function buildSchema<T extends Fields>(
	fields: T,
	values?: Record<string, string>,
	optionsOverrides?: Record<string, readonly Option[] | undefined>
) {
	const shape = {} as ShapeOf<T>;

	for (const field of fields) {
		(shape as Record<string, ZodValidation>)[field.name] =
			field.type === 'repeat'
				? repeatSchema(field)
				: coerced(
						values || optionsOverrides ? resolveField(field, values ?? {}, optionsOverrides) : field
					);
	}

	return z.object(shape);
}

/** The object schema a set of field definitions produces. */
export type FormSchema<T extends Fields> = ReturnType<typeof buildSchema<T>>;

/** The value a single field contributes to the parsed form data. */
export type FieldData<K extends Field> = K extends { type: 'repeat'; fields: infer F }
	? F extends readonly RowField[]
		? { [R in F[number] as R['name']]: z.infer<R['validation']> }[]
		: never
	: K['validation'] extends ZodValidation
		? z.infer<K['validation']>
		: never;

/**
 * The hook for constraints that span more than one field, e.g. a maximum that has to be at least
 * the minimum. Give the issue a `path` to attach it to a field, or leave it off to have it
 * reported against the form as a whole.
 */
export type SchemaRefinement<T extends Fields> = (schema: FormSchema<T>) => z.ZodType;

export function zodSchema<T extends Fields>(
	fields: T,
	refine?: SchemaRefinement<T>,
	/** Resolves each field's `dynamic` limits and options before they are validated. */
	values?: Record<string, string>,
	/**
	 * Options that only exist at runtime, e.g. fetched from the API. Pass the same overrides the
	 * form was rendered with, or a select/radio built from them cannot be checked against the
	 * choices the user was actually offered.
	 */
	optionsOverrides?: Record<string, readonly Option[] | undefined>
): FormSchema<T> {
	const schema = buildSchema(fields, values, optionsOverrides);

	// A refinement only adds issues, it never changes the parsed shape, so the object type still
	// describes the result and callers keep their field-derived inference.
	return refine ? (refine(schema) as unknown as FormSchema<T>) : schema;
}

export type DefaultValues<T extends Field> = {
	[K in T as K['name']]?: K extends { type: 'repeat' }
		? readonly Record<string, string | number | boolean>[]
		: string | number | boolean;
};

/**
 * The starting values for a repeated group, as the flat indexed keys its controls are named after.
 * Values echoed back by a failed submit already arrive flat, so they win over the defaults.
 */
export function repeatDefaults(
	field: RepeatFieldData,
	form: FormProps | null,
	defaultRows?: readonly Record<string, string | number | boolean>[]
): Record<string, string> {
	const submitted = form?.values ?? {};
	const wasSubmitted = Object.keys(submitted).some((key) => key.startsWith(`${field.name}.`));
	const rows = wasSubmitted ? [] : (defaultRows ?? []);

	const values: Record<string, string> = {};
	const rowCount = Math.max(
		wasSubmitted ? rowIndexes(field.name, submitted as Record<string, string>).length : rows.length,
		field.minRows ?? 0
	);

	for (let index = 0; index < rowCount; index++) {
		for (const rowField of field.fields) {
			const name = rowFieldName(field.name, index, rowField.name);
			const value = wasSubmitted
				? submitted[name as keyof typeof submitted]
				: rows[index]?.[rowField.name];
			values[name] = value === undefined || value === null ? '' : String(value);
		}
	}

	return values;
}

// A select/radio needs options from the caller only when the definition supplies neither static
// options nor a `dynamic` function that computes them.
type NeedsOptions<K extends { options?: unknown; dynamic?: unknown }> =
	undefined extends K['options'] ? (undefined extends K['dynamic'] ? true : false) : false;

// mode-aware: fields hidden in this mode aren't rendered, so they must not require options.
export type ModeFields<T extends Field, M extends FormMode> = M extends 'edit'
	? Exclude<T, { createOnly: true }>
	: Exclude<T, { editOnly: true }>;

export type RequiredOptionsOverrides<T extends Field, M extends FormMode> = {
	[
		K in Extract<ModeFields<T, M>, { type: 'select' | 'radio' }> as NeedsOptions<K> extends true
			? K['name']
			: never
	]: readonly Option[];
};

export type OptionalOptionsOverrides<T extends Field> = {
	[
		K in Extract<T, { type: 'select' | 'radio' }> as NeedsOptions<K> extends true
			? never
			: K['name']
	]?: readonly Option[];
};

export type OptionsOverrides<T extends Field, M extends FormMode> = RequiredOptionsOverrides<T, M> &
	OptionalOptionsOverrides<T>;

export type FormValue = string | number | boolean | null | undefined;

export type FormProps<T extends Field = Field> = {
	readonly error?: string;
	readonly errors?: z.core.$ZodIssue[];
	readonly values?: { [K in T['name']]?: FormValue };
};

export const getValue = <T extends Field, K extends T['name']>(
	form: FormProps<T> | null,
	fieldName: K,
	defaultValue?: string | number | boolean
): string => {
	const values = form?.values;

	// Presence decides, not emptiness: a field the user deliberately cleared comes back as an
	// empty or absent value under a key that was submitted, and must stay cleared rather than
	// silently reverting to its default.
	if (values && fieldName in values) {
		const val = values[fieldName as keyof typeof values];
		return val === undefined || val === null ? '' : String(val);
	}

	return defaultValue !== undefined ? String(defaultValue) : '';
};

/** Stable, unique per form instance so error summary links can target the right control. */
export const fieldId = (formId: string, name: string) => `${formId}-${name}`;

/** Applies `dynamic` and the caller-supplied option overrides on top of the static definition. */
export function resolveField<T extends Field>(
	field: T,
	values: Record<string, string>,
	optionsOverrides?: Record<string, readonly Option[] | undefined>
): T & { readonly options?: readonly Option[]; readonly hidden?: boolean } {
	const dynamic = field.dynamic?.(values);
	const options =
		dynamic?.options ??
		('options' in field ? field.options : undefined) ??
		optionsOverrides?.[field.name];

	// The spread widens `T`, so the cast just restores what we know is still there.
	return {
		...field,
		...dynamic,
		...(options ? { options } : {}),
		inputProps: { ...field.inputProps, ...dynamic?.inputProps }
	} as T & { readonly options?: readonly Option[]; readonly hidden?: boolean };
}

/**
 * Keeps values consistent with the constraints other fields impose on them, e.g. a memory option
 * that isn't offered for the selected tier, or a storage size outside the range that tier and
 * memory allow. Applied to the initial values as well as to every edit, so a form never renders a
 * control whose state disagrees with the options and limits it is showing.
 *
 * Fields are visited in declaration order and corrections cascade, so a field may depend on any
 * field declared before it. The field the user is currently editing is left alone, otherwise
 * intermediate keystrokes would be rewritten under the cursor.
 */
export function normalizeValues<T extends Field>(
	fields: readonly T[],
	values: Record<string, string>,
	optionsOverrides?: Record<string, readonly Option[] | undefined>,
	editing?: string
): Record<string, string> {
	const next = { ...values };

	for (const field of fields) {
		if (field.name === editing || field.type === 'repeat') continue;

		const resolved = resolveField(field, next, optionsOverrides);
		const value = next[field.name];

		// A hidden field isn't rendered, so there is no control to keep consistent.
		if (resolved.hidden) continue;

		if (resolved.type === 'select' || resolved.type === 'radio') {
			const options = resolved.options;
			if (options?.length && !options.some((o) => o.value === value)) {
				next[field.name] = options[0].value;
			}
		} else if (resolved.type === 'number' && value !== '' && value !== undefined) {
			const min = Number(resolved.inputProps?.min);
			const max = Number(resolved.inputProps?.max);
			const current = Number(value);
			if (Number.isNaN(current)) continue;
			if (!Number.isNaN(min) && current < min) next[field.name] = String(min);
			else if (!Number.isNaN(max) && current > max) next[field.name] = String(max);
		}
	}

	return next;
}

export type FormSection<T extends Field> =
	| { readonly kind: 'fields'; readonly fields: T[] }
	| { readonly kind: 'group'; readonly group: GroupConfig; readonly fields: T[] };
/**
 * Splits fields into renderable sections while preserving declaration order. A group is rendered
 * where its first field is declared, so moving a field in the definition moves it in the form.
 */
export function buildSections<T extends Field>(
	fields: readonly T[],
	groups: readonly GroupConfig[]
): FormSection<T>[] {
	const sections: FormSection<T>[] = [];
	const groupSections = new Map<string, FormSection<T>>();

	for (const field of fields) {
		const group = field.group ? groups.find((g) => g.name === field.group) : undefined;

		if (!group) {
			const last = sections.at(-1);
			if (last?.kind === 'fields') {
				last.fields.push(field);
			} else {
				sections.push({ kind: 'fields', fields: [field] });
			}
			continue;
		}

		let section = groupSections.get(group.name);
		if (!section) {
			section = { kind: 'group', group, fields: [] };
			groupSections.set(group.name, section);
			sections.push(section);
		}
		section.fields.push(field);
	}

	return sections;
}
