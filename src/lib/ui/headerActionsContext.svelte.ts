import { getContext, hasContext, setContext } from 'svelte';
import type { Snippet } from 'svelte';

const ctxKey = Symbol('headerActions');

class HeaderActionsState {
	snippet: Snippet | null = $state(null);
}

export function createHeaderActionsContext() {
	const ctx = new HeaderActionsState();
	setContext(ctxKey, ctx);
	return ctx;
}

export function getHeaderActionsContext(): HeaderActionsState | undefined {
	if (!hasContext(ctxKey)) return undefined;
	return getContext<HeaderActionsState>(ctxKey);
}
