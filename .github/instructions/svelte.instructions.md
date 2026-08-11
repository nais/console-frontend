---
applyTo: '**/*.svelte'
---

Always use the Svelte MCP server to verify any generated or modified Svelte 5 runes syntax and SvelteKit patterns before presenting the result.

This project uses Svelte 5 with `forceRunesMode: true`. All components must use runes:

- `$state()` for reactive state
- `$derived()` / `$derived.by()` for computed values
- `$props()` for component props with TypeScript types
- `$effect()` only for browser-side effects (DOM, timers, subscriptions), never to sync state or fetch data

Components should use `@nais/ds-svelte-community` before building custom UI elements.
Use `--ax-*` CSS tokens for spacing, colors, and typography — never hardcode raw values.
