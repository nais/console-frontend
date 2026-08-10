import {
	activeFields,
	collectFormData,
	zodSchema,
	type Field,
	type Fields,
	type FieldData,
	type FormMode,
	type FormValue,
	type ModeFields,
	type Option,
	type SchemaRefinement
} from '$lib/ui/Form/form';
import { fail, redirect, type ActionFailure, type RequestEvent } from '@sveltejs/kit';
import type * as z from 'zod';

/**
 * The single payload shape a form action may fail with. It matches `FormProps`, so any failure a
 * route returns can be handed straight back to `<Form>`.
 */
export type FormFailure = {
	error?: string;
	errors?: z.core.$ZodIssue[];
	values: Record<string, FormValue>;
};

type ErrorResponse = {
	success: false;
	errorResponse: ActionFailure<FormFailure>;
};

type SuccessResponse<T> = {
	success: true;
	data: T;
	/**
	 * The raw submission, exactly as the controls sent it. Fail with these values so a later
	 * failure re-renders what the user typed rather than the parsed and coerced ones.
	 */
	values: Record<string, FormValue>;
};

// Mirrors the field filtering in Form.svelte: fields that don't apply to this mode are excluded
// from validation and from the returned data shape.
type ActiveData<T extends Fields, M extends FormMode> = {
	[K in ModeFields<T[number], M> as K['name']]: FieldData<K>;
};

/** Fails a form action with a message that isn't tied to a single field, e.g. an API error. */
function formError(
	message: string,
	values: Record<string, FormValue>,
	status = 400
): ActionFailure<FormFailure> {
	return fail(status, { error: message, values });
}

/**
 * A GraphQL error as the API actually sends it. Houdini's types only promise `message`, but the
 * payload carries the information needed to put an error on the field that caused it.
 */
type GraphQLErrorLike = {
	message: string;
	path?: readonly (string | number)[] | null;
	extensions?: { field?: unknown } | null;
};

/**
 * Where the API says an error belongs, in the two shapes it uses:
 *
 *   { message, path: ['createValkey', 'input', 'teamSlug'] }
 *   { message, path: ['createValkey'], extensions: { field: 'name' } }
 *
 * `extensions.field` wins because it is explicit. Otherwise everything after `input` in the path
 * is the field, which also covers nested inputs, e.g. `[..., 'input', 'variables', 0, 'name']`.
 */
function errorPath(error: GraphQLErrorLike): (string | number)[] {
	const field = error.extensions?.field;
	if (typeof field === 'string' && field.length > 0) {
		return field.split('.').map((part) => (/^\d+$/.test(part) ? Number(part) : part));
	}

	const path = error.path ?? [];
	const start = path.lastIndexOf('input');
	return start === -1 ? [] : path.slice(start + 1);
}

/**
 * Turns API errors into issues shaped like the ones zod produces, so a mutation that rejects a
 * value reports it on the offending control instead of as an anonymous banner. `<Form>` links an
 * issue whose path matches a rendered field and shows the rest as form-level messages, so an
 * error naming something that isn't a form field (a route param, say) still reaches the user.
 *
 * @param rename Maps an API input name onto the form field it came from, for the cases where the
 * two differ. A key matching the whole path wins (`'replicas.min': 'min'`), otherwise the leading
 * segment is renamed (`environmentVariables: 'variables'`), which keeps indexes and nested names
 * inside a repeated group intact.
 */
export function graphqlIssues(
	errors: readonly GraphQLErrorLike[],
	rename?: Record<string, string>
): z.core.$ZodIssue[] {
	const asPath = (key: string) =>
		key.split('.').map((part) => (/^\d+$/.test(part) ? Number(part) : part));

	return errors.map((error) => {
		const path = errorPath(error);
		const whole = rename?.[path.join('.')];
		const [head, ...rest] = path;

		const renamed = whole
			? asPath(whole)
			: typeof head === 'string' && rename?.[head]
				? [rename[head], ...rest]
				: path.slice();

		return {
			code: 'custom',
			path: renamed,
			message: error.message,
			input: undefined
		} satisfies z.core.$ZodIssueCustom as z.core.$ZodIssue;
	});
}

/** The subset of a Houdini mutation store the action helper needs. */
type MutationLike<Data, Input> = {
	mutate(
		variables: Input,
		config: { event: RequestEvent }
	): Promise<{ data: Data | null; errors: readonly { message: string }[] | null }>;
};

/** Anything the helper accepts either directly or computed from the request. */
type Resolvable<T> = T | ((event: RequestEvent) => T);

const resolve = <T>(value: Resolvable<T>, event: RequestEvent): T =>
	typeof value === 'function' ? (value as (event: RequestEvent) => T)(event) : value;

/**
 * Every param in a route's pattern is present by the time its action runs, which is what the
 * route's own generated types say. The shared `RequestEvent` can't express that, so the params
 * are narrowed here rather than making every call site assert it away.
 */
type Params = Record<string, string>;

type SuccessContext<T extends Fields, M extends FormMode, Data> = {
	/** The validated, coerced form data. */
	data: ActiveData<T, M>;
	/** The mutation payload, narrowed to non-null. */
	result: Data;
	event: RequestEvent;
	params: Params;
};

type FormActionConfig<T extends Fields, M extends FormMode, Data, Input> = {
	/** A function when the definition depends on the request, e.g. a name to confirm. */
	fields: Resolvable<T>;
	mode?: M;
	refine?: SchemaRefinement<T>;
	/**
	 * Options that only exist at runtime. Pass the same ones the page renders with, or a select
	 * built from them can't be checked against the choices the user was offered. May be async, for
	 * the common case of having to fetch them.
	 */
	optionsOverrides?: Resolvable<
		| Record<string, readonly Option[] | undefined>
		| Promise<Record<string, readonly Option[] | undefined>>
	>;
	mutation: MutationLike<Data, Input>;
	variables: (context: { data: ActiveData<T, M>; event: RequestEvent; params: Params }) => Input;
	/** Shown when the mutation fails without saying why. */
	message: string;
	/**
	 * For mutations that report failure in their payload rather than as an error, e.g. a
	 * `deleted: false`. Returning false fails the action with `message`.
	 */
	succeeded?: (result: Data) => boolean;
	/** Maps API input names onto form field names where they differ. */
	rename?: Record<string, string>;
	/** Where to go on success. Omit to stay put and return `onSuccess` instead. */
	redirectTo?: (context: SuccessContext<T, M, Data>) => string;
	/** What to hand back to the page on success, for forms that render their result. */
	onSuccess?: (context: SuccessContext<T, M, Data>) => unknown;
};

/**
 * Builds the whole validate, mutate, report cycle a form action performs, so a route only has to
 * say what it validates, what it sends and where it goes afterwards.
 *
 * Errors the API attributes to an input field are reported on that field; anything else becomes a
 * form-level message. The submitted values are echoed back on every failure, so the page
 * re-renders what the user typed.
 */
export function formAction<
	T extends Fields,
	Data extends Record<string, unknown>,
	Input,
	M extends FormMode = 'create'
>(config: FormActionConfig<T, M, Data, Input>) {
	return async (event: RequestEvent) => {
		const data = await validateForm({
			event,
			fields: resolve(config.fields, event),
			mode: config.mode,
			refine: config.refine,
			optionsOverrides: config.optionsOverrides
				? await resolve(config.optionsOverrides, event)
				: undefined
		});

		if (!data.success) {
			return data.errorResponse;
		}

		const res = await config.mutation.mutate(
			config.variables({ data: data.data, event, params: event.params as Params }),
			{ event }
		);

		if (res.errors?.length) {
			// A mapped issue lands on its field; the message is kept as well so a failure is still
			// reported even when every issue turns out to name something the form doesn't render.
			return fail(422, {
				error: config.message,
				errors: graphqlIssues(res.errors as readonly GraphQLErrorLike[], config.rename),
				values: data.values
			});
		}

		if (!res.data || config.succeeded?.(res.data) === false) {
			return formError(config.message, data.values, 500);
		}

		const context: SuccessContext<T, M, Data> = {
			data: data.data,
			result: res.data,
			event,
			params: event.params as Params
		};

		const result = config.onSuccess?.(context);

		// `redirect` throws, so it has to come last: anything after it would be unreachable.
		if (config.redirectTo) {
			redirect(303, config.redirectTo(context));
		}

		return result ?? { success: true };
	};
}

export async function validateForm<T extends Fields, M extends FormMode = 'create'>({
	event,
	fields,
	mode = 'create' as M,
	refine,
	optionsOverrides
}: {
	event: RequestEvent;
	fields: T;
	mode?: M;
	/** Cross-field constraints, e.g. a maximum that has to be at least the minimum. */
	refine?: SchemaRefinement<T>;
	/**
	 * The same runtime options the page rendered the form with. Without them a select or radio
	 * whose choices come from the API cannot be checked against what the user was offered, and any
	 * value would be accepted.
	 */
	optionsOverrides?: Record<string, readonly Option[] | undefined>;
}): Promise<ErrorResponse | SuccessResponse<ActiveData<T, M>>> {
	const formData = Object.fromEntries(
		Array.from(await event.request.formData(), ([key, value]) => [
			key,
			typeof value === 'string' ? value : ''
		])
	);

	// The submitted values decide which conditionally hidden fields were actually rendered, and
	// which limits and options each field was rendered under, so the server validates exactly what
	// the user was shown.
	const fieldsToValidate = activeFields(fields as readonly Field[], mode, formData);
	const schema = zodSchema(fieldsToValidate as unknown as T, refine, formData, optionsOverrides);
	const result = await schema.safeParseAsync(collectFormData(fieldsToValidate, formData));

	if (!result.success) {
		return {
			success: false,
			errorResponse: fail(422, { errors: result.error.issues, values: formData })
		};
	}

	return {
		success: true,
		data: result.data as ActiveData<T, M>,
		values: formData
	};
}
