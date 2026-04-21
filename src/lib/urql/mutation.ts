import type { RequestEvent } from '@sveltejs/kit';
import type { AnyVariables, OperationResult, TypedDocumentNode } from '@urql/core';
import { createUrqlClient } from './client';

/**
 * Subset of `event` that {@link runMutation} actually needs. Accepts both
 * the universal load event and the server-only `RequestEvent` used by form
 * actions and `+page.server.ts` `load`s.
 *
 * On the server, `event.locals.urql` is populated by `hooks.server.ts` so
 * every operation for a single request shares the same urql client. On
 * the client we don't have `locals`, so a fresh client is created bound
 * to SvelteKit's `event.fetch` (which keeps cookies and the
 * `handleFetch` hook plumbing working).
 */
export type RunMutationEvent =
	| (RequestEvent & { fetch: typeof fetch })
	| { fetch: typeof fetch; locals?: { urql?: ReturnType<typeof createUrqlClient> } };

/**
 * Shape returned by {@link runMutation}.
 *
 * Mirrors the small slice of Houdini's `mutation.mutate(...)` return shape
 * that the rest of the app actually consumes (`.data` and `.errors`), so
 * migrating call-sites is mostly a matter of swapping the import. The
 * `errors` field is normalized to the `{ message }[]` shape that
 * SvelteKit form actions and `GraphErrors.svelte` already understand.
 */
export interface RunMutationResult<TData> {
	data: TData | null;
	errors: { message: string }[] | null;
}

/**
 * Run a GraphQL mutation from a server-side context (typically a SvelteKit
 * form action in a `+page.server.ts`).
 *
 * On the server the mutation is executed against the per-request urql
 * client stashed on `event.locals.urql` (created in `hooks.server.ts`),
 * so it shares a normalized cache with any queries that ran during the
 * same request. Falls back to a fresh client when `event.locals.urql`
 * isn't available.
 *
 * Unlike {@link runQuery}, this helper does **not** flip
 * `isAuthenticated` on `Unauthorized` errors: form actions run on the
 * server, where there's no Svelte store to flip, and the auth flow is
 * driven by the universal `+layout.ts` load anyway. Callers that need
 * to surface auth errors should inspect the returned `errors` array.
 */
export async function runMutation<TData, TVariables extends AnyVariables>(
	event: RunMutationEvent,
	doc: TypedDocumentNode<TData, TVariables>,
	variables: TVariables
): Promise<RunMutationResult<TData>> {
	const locals = (event as { locals?: { urql?: ReturnType<typeof createUrqlClient> } }).locals;
	const ctx = locals?.urql ?? createUrqlClient({ fetch: event.fetch });

	const result = (await ctx.client.mutation(doc, variables).toPromise()) as OperationResult<
		TData,
		TVariables
	>;

	const errors =
		result.error?.graphQLErrors?.map((e) => ({ message: e.message })) ??
		(result.error ? [{ message: result.error.message }] : null);

	return {
		data: (result.data ?? null) as TData | null,
		errors
	};
}
