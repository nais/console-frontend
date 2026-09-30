---
applyTo: '**/*.svelte'
---

Always use the Svelte MCP server to verify any generated or modified Svelte 5 runes syntax and SvelteKit patterns before presenting the result.

This project uses Svelte 5 with `forceRunesMode: true`. All components must use runes:

- `$state()` for reactive state
- `$derived()` / `$derived.by()` for computed values
- `$props()` for component props with TypeScript types
- `$props.id()` for hydration-stable instance IDs used by labels and ARIA relationships
- `{const ...}` / `{let ...}` for local markup values; use `$derived(...)` inside declarations that must react to changing state (`{@const ...}` is legacy)
- `$inspect()` / `$inspect.trace()` for development-only reactive diagnostics
- Writable `$derived` only for temporary optimistic overrides of computed values
- Typed `createContext<T>()` when introducing shared context; `getAbortSignal()` for cancellable async work in a derived value or effect
- `{@attach}` for element-owned DOM integrations, including third-party setup and cleanup; use nested `$effect()` for reactive updates that should not recreate the integration
- `$effect()` as an escape hatch for other browser-side effects (timers, subscriptions, external I/O)
- Do not use `$effect()` to trigger GraphQL query fetches or to sync one piece of state with another. If you believe an effect is the only viable solution, add a comment explaining why no derived value or load function applies.

Components should use `@nais/ds-svelte-community` before building custom UI elements.
Use `--ax-*` CSS tokens for spacing, colors, and typography — never hardcode raw values.
