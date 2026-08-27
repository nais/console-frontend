# Copilot Instructions

When performing a code review, use the Svelte MCP server to validate Svelte 5 patterns and SvelteKit conventions. If the Svelte MCP server is unavailable, proceed with the code review using your own knowledge of Svelte 5 and SvelteKit conventions, and note that MCP validation was skipped.

When performing a code review, enforce these project rules. Report all rule violations found. List Svelte 5 runes violations and Houdini GraphQL violations first as they are project-critical, followed by design system and accessibility issues.

- This project uses **Svelte 5 runes mode**. Flag any use of `$:` reactive statements, `let`-based reactivity, or `createEventDispatcher`. Require `$state()`, `$derived()`, `$props()`, and callback props instead.
- This project uses **Houdini** for GraphQL. Flag any use of Apollo, urql, or other GraphQL clients. Flag `$effect()` used to trigger GraphQL query fetches. Non-GraphQL async side effects in `$effect()` are permitted. GraphQL queries must use `.gql` files with `load_` functions in `+page.ts` instead.
- Flag `first: 500` or similar high-number pagination hacks in GraphQL queries.
- `schema.graphql` is auto-generated. Do not suggest changes to it.
- Use `@nais/ds-svelte-community` components (`Button`, `Modal`, `Alert`, `Table`, `Heading`, etc.) before building custom HTML.
- Use `--ax-*` design tokens for spacing, colors, and typography. Never hardcode raw CSS values like `0.5rem`, `#333`, or `8px`.
- In union/interface queries, select shared fields at the interface level. Only use inline fragments for type-specific fields. If a concrete type has no type-specific fields but the component discriminates on its `__typename`, add a minimal inline fragment (`... on Type { __typename }`) so Houdini includes it in the generated type union.
- Flag accessibility issues: missing `aria-label` on icon-only buttons, improper heading hierarchy, missing form labels, non-semantic elements used as interactive controls.
