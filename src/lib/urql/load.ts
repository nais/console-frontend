import { isAuthenticated, isUnauthenticated } from '$lib/authentication';
import type { LoadEvent, RequestEvent, ServerLoadEvent } from '@sveltejs/kit';
import type { AnyVariables, OperationResult, TypedDocumentNode } from '@urql/core';
import { createUrqlClient, type UrqlContext } from './client';

/**
 * Subset of `event` that `runQuery` actually needs. Accepts both the
 * universal (`+page.ts` / `+layout.ts`) load event and the server-only
 * (`+page.server.ts` / `+layout.server.ts` / `hooks.server.ts`) variants.
 *
 * On the server, `event.locals.urql` is populated by `hooks.server.ts` so
 * every `load` for a single request shares the same urql client and SSR
 * exchange. On the client we don't have `locals`, so `runQuery` falls back
 * to creating a fresh urql client bound to SvelteKit's `event.fetch`.
 */
export type RunQueryEvent = LoadEvent | ServerLoadEvent | (RequestEvent & { fetch: typeof fetch });

/**
 * Shape returned by {@link runQuery}.
 *
 * This intentionally mirrors the small slice of Houdini's `load_X` return
 * shape that the rest of the app actually consumes (`.data` and `.errors`),
 * so migrating call-sites is mostly a matter of swapping the import. The
 * `errors` field is normalized to the `{ message }[]` shape that
 * `GraphErrors.svelte` and `isUnauthenticated` already understand.
 */
export interface RunQueryResult<TData> {
	data: TData | null;
	errors: { message: string }[] | null;
}

/**
 * Run a GraphQL query inside a SvelteKit `load` function.
 *
 * On the server the query is executed against the per-request urql client
 * stashed on `event.locals.urql` (created in `hooks.server.ts`), so all
 * `load`s for a single request share one normalized cache and the SSR
 * exchange that `+layout.server.ts` later serializes to the browser.
 *
 * On the client there are no `event.locals`, so a fresh urql client is
 * created bound to the SvelteKit `event.fetch` (which is identical to
 * `globalThis.fetch` on the client, but going through `event.fetch` keeps
 * SvelteKit's request tracking happy).
 *
 * If the result contains an `Unauthorized` error, `isAuthenticated` is
 * flipped to `false` so the root layout swaps the page out for the login
 * screen — the same behavior Houdini's `handleMissingLogin` plugin
 * provided. We do this here in addition to the `mapExchange` in
 * `client.ts` so that errors raised by queries running inside a `load`
 * (which may be using a freshly-created client without our exchanges, on
 * the universal-load code path) still gate the auth flow correctly.
 */
export async function runQuery<TData, TVariables extends AnyVariables>(
	event: RunQueryEvent,
	doc: TypedDocumentNode<TData, TVariables>,
	variables: TVariables,
	options: { ignoreAuthErrors?: boolean } = {}
): Promise<RunQueryResult<TData>> {
	const ctx = getOrCreateClient(event);

	const result = (await ctx.client.query(doc, variables).toPromise()) as OperationResult<
		TData,
		TVariables
	>;

	const errors =
		result.error?.graphQLErrors?.map((e) => ({ message: e.message })) ??
		(result.error ? [{ message: result.error.message }] : null);

	if (!options.ignoreAuthErrors && isUnauthenticated(errors)) {
		isAuthenticated.set(false);
	}

	return {
		data: (result.data ?? null) as TData | null,
		errors
	};
}

/**
 * Pull the per-request urql client off `event.locals` when running on the
 * server, or create a fresh one bound to `event.fetch` when running in the
 * browser. Either way the returned client+ssr pair is suitable for issuing
 * one or more queries from a single `load` invocation.
 */
function getOrCreateClient(event: RunQueryEvent): UrqlContext {
	const locals = (event as { locals?: { urql?: UrqlContext } }).locals;
	if (locals?.urql) {
		return locals.urql;
	}
	return createUrqlClient({ fetch: event.fetch });
}
