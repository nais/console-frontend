# Copilot Instructions

When performing a code review, use the Svelte MCP server to validate Svelte 5 patterns and SvelteKit conventions. If the Svelte MCP server is unavailable, proceed with the code review using your own knowledge of Svelte 5 and SvelteKit conventions, and note that MCP validation was skipped.

When performing a code review, enforce these project rules. Report all rule violations found. List Svelte 5 runes violations and Houdini GraphQL violations first as they are project-critical, followed by design system and accessibility issues.

- This project uses **Svelte 5 runes mode**. Flag any use of `$:` reactive statements, `let`-based reactivity, or `createEventDispatcher`. Require `$state()`, `$derived()`, `$props()`, and callback props instead.
- This project uses **Houdini** for GraphQL. Flag any use of Apollo, urql, or other GraphQL clients. Flag `$effect()` used to trigger GraphQL query fetches. Non-GraphQL async side effects in `$effect()` are permitted. GraphQL queries must use `.gql` files with `load_` functions in `+page.ts` instead.
- Flag `first: 500` or similar high-number pagination hacks in GraphQL queries.
- `schema.graphql` is auto-generated. Do not suggest changes to it.
- Use `@nais/ds-svelte-community` components (`Button`, `Modal`, `Alert`, `Table`, `Heading`, etc.) before building custom HTML.
- Use `--ax-*` design tokens for spacing, colors, and typography. Never hardcode raw CSS values like `0.5rem`, `#333`, or `8px`.
- Houdini 2.0 has a bug where fields selected at the interface level are not available at runtime for types without an explicit inline fragment. Every concrete type in a union/interface query must have its own inline fragment with all needed fields — do not rely on interface-level field selection.
- Flag accessibility issues: missing `aria-label` on icon-only buttons, improper heading hierarchy, missing form labels, non-semantic elements used as interactive controls.
