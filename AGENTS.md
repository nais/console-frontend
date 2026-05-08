# AGENTS.md - Console Frontend

Guidelines for AI agents working with this project.

---

## Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

### Test Users

Set in `.env`:

| User                        | Description            |
| --------------------------- | ---------------------- |
| `dev.usersen@example.com`   | Regular user with team |
| `admin.usersen@example.com` | Administrator          |

### Schema Endpoint

Houdini fetches schema from `VITE_SCHEMA_ENDPOINT`. Configure in `.env`:

```bash
# Local API
VITE_SCHEMA_ENDPOINT="http://localhost:3000/graphql"

# API via nais proxy
VITE_SCHEMA_ENDPOINT="http://localhost:4242/graphql"
```

To connect to local API, run `nais alpha api proxy` on host machine.

---

### schema.graphql

This file is auto-generated from [nais/api](https://github.com/nais/api) and must not be manually edited. Do not suggest or apply changes to `schema.graphql`.

---

## Common Commands

| Task        | Command          |
| ----------- | ---------------- |
| Run locally | `npm run dev`    |
| Build       | `npm run build`  |
| Type check  | `npm run check`  |
| Lint        | `npm run lint`   |
| Format code | `npm run format` |
| Run tests   | `npm run test`   |

---

## MCP Tools

You have access to the Svelte MCP server with Svelte 5 and SvelteKit documentation.

### list-sections

Use this FIRST to find relevant documentation sections.

### get-documentation

Fetches full documentation for specific sections. Analyze `use_cases` from list-sections to find relevant sections.

### svelte-autofixer

Analyzes Svelte code and returns issues and suggestions. **ALWAYS use this before sending Svelte code to the user.**

### playground-link

Generates Svelte Playground link. Ask user first, and NEVER if code was written to files in the project.

---

## CSS Variables from @nais/ds-svelte-community

**CRITICAL**: Only use CSS variables that exist in the @nais/ds-svelte-community design system. Never invent CSS variable names.

### Available CSS Variable Categories:

#### Spacing (use these design tokens, not arbitrary values)

- Common tokens include: `--ax-space-1`, `--ax-space-2`, `--ax-space-4`, `--ax-space-6`, `--ax-space-8`, `--ax-space-12`, `--ax-space-16`, `--ax-space-20`, `--ax-space-24`, `--ax-space-32`, `--ax-space-40`, `--ax-space-64`
- This list is not exhaustive; follow existing spacing tokens in the codebase and rely on the ESLint checks to validate new usages and unused GraphQL files

#### Typography

- Font sizes: `--ax-font-size-small`, `--ax-font-size-medium`, `--ax-font-size-large`, `--ax-font-size-xlarge`
- Font weights: `--ax-font-weight-regular`, `--ax-font-weight-bold`
- Line heights: `--ax-font-line-height-large`, `--ax-font-line-height-heading-medium`
- **Font family**: Use `monospace` directly, NOT a CSS variable (there is no `--ax-font-family-mono`)

#### Colors - Text

- Common tokens: `--ax-text-neutral`, `--ax-text-subtle`, `--ax-text-accent`
- Semantic colors: `--ax-text-danger`, `--ax-text-danger-decoration`, `--ax-text-success`, `--ax-text-success-decoration`, `--ax-text-success-subtle`, `--ax-text-warning`, `--ax-text-neutral-subtle`
- Many other text variants exist (`--ax-text-bg-*`, `--ax-text-border-*`, etc.); search the codebase for patterns

#### Colors - Borders

- `--ax-border-neutral-subtleA`, `--ax-border-warning`

#### Colors - Neutrals (backgrounds)

- `--ax-neutral-000`, `--ax-neutral-100`, `--ax-neutral-200`

#### Custom Project Variables

- `--spacing-layout` (defined in app.css, uses `--ax-space-40`)

### Rules for CSS Variables:

1. **Before using ANY CSS variable**, search the codebase first for existing usage patterns. For new tokens, verify they exist in the @nais/ds-svelte-community design system or rely on the ESLint checks for validation
2. **Never invent** CSS variable names like `--ax-font-family-mono`, `--ax-color-*`, etc.
3. **For font-family**: Use `font-family: monospace` directly (not a CSS variable)
4. **For spacing**: Use the predefined spacing scale, not arbitrary values
5. **Run validation**: The project’s ESLint configuration includes project checks for missing CSS variables and unused GraphQL files
6. **When in doubt**: Search existing `.svelte` and `.css` files for similar patterns before creating new styles
7. **Lists are non-exhaustive**: The design system has more tokens than listed here; use the ESLint checks to confirm

---

## Svelte 5 Runes

This project uses **Svelte 5 with runes mode** (enforced via `forceRunesMode: true` in Houdini config).

### Required Patterns:

- Use `$state()` for reactive state (not `let` with reactivity)
- Use `$derived()` for computed values (not `$:`)
- Treat `$effect()` as an escape hatch for browser-side effects such as DOM integration, subscriptions, or external I/O
- Prefer `$derived()`/`$derived.by()` for derived state and explicit event handlers for input-driven flows like debounced search
- Do not use `$effect()` to synchronize one piece of state with another unless there is no clearer alternative
- Use `$props()` for component props with TypeScript types

### Example:

```svelte
<script lang="ts">
	let count = $state(0);
	let doubled = $derived(count * 2);

	$effect(() => {
		console.log('Count changed:', count);
	});

	let { data }: { data: MyType } = $props();
</script>
```

---

## GraphQL with Houdini

This project uses **Houdini** for GraphQL, not Apollo or other clients.

### Patterns:

- **Separate .gql files**: For page/layout queries, use `.gql` files and `load_QueryName` functions
- **Inline queries**: Use `const myQuery = graphql(\`...\`)` for component-level queries/mutations
- Access store data/errors via the `$` prefix: `$myQuery.data`, `$myQuery.errors`
- Mutations pass variables directly: `await myMutation.mutate({ id, name })`
- Check for errors: `if ($myQuery.errors) { ... }`
- Use `$myQuery.fetching` for loading states

### Example (.gql file for routes):

```graphql
# src/routes/+page.gql
query MyPageData {
	items {
		id
		name
	}
}
```

```typescript
// src/routes/+page.ts
import { load_MyPageData } from '$houdini';

export async function load(event) {
	return {
		...(await load_MyPageData({ event }))
	};
}
```

### Example (inline for components):

```svelte
<script lang="ts">
	import { graphql } from '$houdini';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';

	const myMutation = graphql(`
		mutation UpdateItem($id: ID!, $name: String!) {
			updateItem(input: { id: $id, name: $name }) {
				item {
					id
					name
				}
			}
		}
	`);

	async function update() {
		await myMutation.mutate({ id: '123', name: 'New Name' });
		if ($myMutation.errors) {
			return; // Display errors with GraphErrors component
		}
		// Success - continue with next steps
	}
</script>

<GraphErrors errors={$myMutation.errors} />
```

---

## Component Library

Use `@nais/ds-svelte-community` components, not custom implementations:

- `Button`, `Modal`, `Alert`, `Table`, `Heading`, etc.
- Icons: Import from `@nais/ds-svelte-community/icons`
- Always check existing components before creating new ones

---

## Design Guidelines

This project layers project-level design conventions on top of the `@nais/ds-svelte-community` design system. Always prefer design system components and `--ax-*` tokens first; the `--surface-*` variables are project extensions that compose them.

### Surface System

Global CSS custom properties and utility classes defined in `src/styles/app.css`:

- `--surface-accent-color` — brand accent (uses `--ax-text-brand-blue`), with dark mode override
- `--surface-icon-size` / `--surface-icon-glyph-size` — icon container and glyph sizing (default `2.25rem` / `1.5rem`)
- `--surface-elevated-background` / `--surface-elevated-shadow` — gradient background and layered shadow for elevated cards
- `--surface-icon-background` / `--surface-icon-shadow` — gradient fill and inset shadow for icon containers

Global utility classes:

- `.surface-icon` — rounded icon container with gradient background and shadow. Override `--surface-icon-size` locally for compact contexts (e.g., `2rem` in sidebar cards).
- `.surface-icon-timeline` — adds `position: relative; z-index: 1` so timeline connector lines render behind the icon.
- `.surface-interactive` — hoverable card/link surface with subtle border, lift-on-hover transform, and accent tint.

### SurfaceCard Component

Use `SurfaceCard` (`$lib/ui/SurfaceCard.svelte`) for elevated content sections:

- Props: `title` (uppercase eyebrow label), `headerAside` (snippet), `reverseGradient`
- Applies `--surface-elevated-background` and `--surface-elevated-shadow`
- Use for dashboard widgets, sidebar cards, and overview panels
- **`reverseGradient` convention**: Use `reverseGradient` for main content cards (left column in two-column layouts) and single-column pages. Omit it for sidebar/right-column (300px) cards.

### Tab Navigation Pattern

Use `Tabs`, `TabList`, `Tab` from `@nais/ds-svelte-community` for route-based sub-navigation:

- Size: `"small"`
- Render tabs as anchor links: `<Tab as="a" href={...}>`
- Define tabs as a `$derived` array of `{ value, label, href }` where `value` is the SvelteKit route ID
- Match active tab via `page.route.id`
- Hide the tab bar when the current route doesn't match any tab (`visibleTabs` pattern)
- See `src/routes/team/[team]/[env]/app/[app]/+layout.svelte` for reference

### Timeline / Activity Log Pattern

For vertical timelines with icon nodes:

- Use `.surface-icon.surface-icon-timeline` for each icon node
- Timeline connector: `::before` pseudo-element on `.activity-item:not(:last-child)` — a 2px vertical line using `--ax-border-neutral-subtleA`
- Hide the connector on the last child and on mobile (`@media (max-width: 767px)`)
- Override `--surface-icon-size` to `2rem` in compact card contexts
- Map GraphQL `__typename` to icon components via a shared `Record<string, Component>` (see `src/lib/domain/activity/activity-log-icons.ts`)

### Dynamic Component Dispatch

When rendering type-specific content from GraphQL unions:

- Create a lookup function that maps `__typename` → Svelte component
- All variant components share a common props interface (e.g., `{ data: FragmentType }`)
- Provide a `DefaultText` fallback for unknown or new types
- See `src/lib/domain/activity/workload/textComponent.ts` for reference

### Key Rules

1. **Components first**: Use `@nais/ds-svelte-community` components (`Button`, `Tabs`, `Alert`, `Tooltip`, `Table`, etc.) before building custom HTML
2. **Tokens first**: Use `--ax-*` tokens for spacing, colors, borders, and radii — never hardcode raw values
3. **Surface variables compose tokens**: The `--surface-*` variables are project-level abstractions built from `--ax-*` tokens — do not bypass them with raw color values
4. **Icons**: Import from `@nais/ds-svelte-community/icons` or `$lib/icons/` — never use inline SVGs
5. **Dark mode**: The surface system handles dark mode via CSS selectors on the root element; do not add separate dark-mode overrides for surface properties

---

## Responsive UI / Mobile

- New pages and substantial page changes must work on narrow mobile widths, not just desktop layouts.
- Use existing responsive patterns in the codebase before inventing route-specific mobile solutions.
- For wide data tables, prefer a horizontal scroll wrapper around the desktop table before introducing a separate mobile card view.
- Keep pagination outside horizontal scroll containers.
- Avoid blanket `white-space: nowrap` and large fixed `min-width` rules across entire tables; let value-heavy columns wrap and keep only the columns that need it non-wrapping.
- If tabs overflow on narrow screens, make the tab row horizontally scrollable and keep labels on a single line.

---

## Code Quality

### Before committing and pushing:

Run these checks in order (mirrors the CI pipeline in `.github/workflows/pr.yaml`):

1. `npm run lockfile-lint` — validate lockfile
2. `npx svelte-kit sync` — sync SvelteKit generated files
3. `npm run check` — Houdini generation + svelte-check (type check, `--fail-on-warnings`)
4. `npm run lint` — Prettier + ESLint
5. `npm run test -- --run` — run all tests
6. `helm lint --strict ./charts` — Helm chart validation (requires helm CLI)

All of these must pass before committing. If prettier reports issues, fix them with `npm run format` and include the formatting in the same commit.

### File Naming:

- Components: PascalCase (e.g., `MyComponent.svelte`)
- Routes: Lowercase with brackets for params (e.g., `[team]/+page.svelte`)
- Utilities: camelCase (e.g., `formatters.ts`)
- Tests: `*.test.ts`

---

## Security & Elevation

This project has **elevation patterns** for accessing sensitive resources (e.g., secrets):

- Check `viewerCanElevate` before showing elevation UI
- Use elevation modals with justification
- Handle expiration timers with `$effect()`
- Always validate RBAC even if elevation metadata is stale
