# AGENTS.md - Console Frontend

Guidelines for AI agents working with this project.

---

## Local Development

```bash
pnpm install
cp .env.example .env
pnpm run dev
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

| Task        | Command           |
| ----------- | ----------------- |
| Run locally | `pnpm run dev`    |
| Build       | `pnpm run build`  |
| Type check  | `pnpm run check`  |
| Lint        | `pnpm run lint`   |
| Format code | `pnpm run format` |
| Run tests   | `pnpm run test`   |

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
5. **For text color**: Prefer `--ax-text-neutral` as the default text color. Only use `--ax-text-subtle` when explicitly asked for subdued/secondary text
6. **Run validation**: The project's ESLint configuration includes project checks for missing CSS variables and unused GraphQL files
7. **When in doubt**: Search existing `.svelte` and `.css` files for similar patterns before creating new styles
8. **Lists are non-exhaustive**: The design system has more tokens than listed here; use the ESLint checks to confirm

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

### Query Design Rules:

- **Never use `first: <high_number>`** (e.g., `first: 500`, `first: 9999`) to fetch all items in a paginated connection. This is a code smell that means the API is missing a proper resolver.
- If you need an overview of all items (e.g., all applications for a team), the backend in [nais/api](https://github.com/nais/api) should expose a dedicated field or resolver that returns the full list without requiring pagination hacks.
- Do not work around missing backend capabilities by over-fetching on the frontend. Instead, flag it as a missing API feature that needs a backend change.

### Non-Exhaustive Types (Houdini 2.0)

Houdini 2.0 adds a `{ __typename: "non-exhaustive; don't match this" }` catch-all variant to every interface/union result type. This variant has **no fields** — accessing `id`, `createdAt`, etc. on it causes type errors.

Additionally, the **masked `$result` type** only includes fields explicitly listed in each `... on Type { }` inline fragment. Fields selected at the interface level (outside inline fragments) are NOT propagated to each variant's type.

#### Rules for interface/union queries:

1. **Include shared fields in each inline fragment** — don't rely on interface-level field selection:

   ```graphql
   # Wrong — createdAt won't appear on ApplicationScaledActivityLogEntry in TypeScript
   activityLog {
     nodes {
       id
       createdAt
       ... on ApplicationScaledActivityLogEntry {
         id
         data { newSize direction }
       }
     }
   }

   # Correct — include createdAt in every inline fragment
   activityLog {
     nodes {
       ... on ApplicationScaledActivityLogEntry {
         id
         createdAt
         data { newSize direction }
       }
       ... on DeploymentActivityLogEntry {
         id
         createdAt
       }
     }
   }
   ```

2. **Use `exhaustive()` from `$lib/utils/houdini`** to filter the non-exhaustive catch-all from arrays:

   ```typescript
   import { exhaustive, type Exhaustive } from '$lib/utils/houdini';

   // Filter out non-exhaustive variants before iterating
   const realNodes = exhaustive(activityLog.nodes);

   // Use the Exhaustive<T> type for type aliases
   type LogNode = Exhaustive<(typeof activityLog.nodes)[number]>;
   ```

3. **For `{#each}` keys on interface arrays** — use index `(i)` instead of `(item.id)` when `id` isn't guaranteed on the non-exhaustive variant:

   ```svelte
   {#each items as item, i (i)}
   ```

4. **Avoid aliases in inline fragments on interfaces** — Houdini 2.0 has a bug where `alias: field` generates the original field name in TypeScript types instead of the alias. Use the field name directly.

5. **Don't use manual type annotations to work around generated types** — import the `$result` type from `$houdini` instead of writing inline type annotations that duplicate and diverge from the generated types.

### Fragment Types on Interfaces (Houdini 2.0)

When a `fragment()` is defined on an **interface** type, Houdini generates a **flat object** with nullable type-keyed properties — NOT a `__typename`-discriminated union. This is structural and unrelated to the `defaultFragmentMasking` config.

```typescript
// Generated IssueFragment$data — flat structure, NOT a union
{
  teamEnvironment: { ... };     // shared interface fields (always present)
  message: string;
  severity: string;
  DeprecatedIngressIssue: { application: { name: string }; ingresses: string[] } | null;
  OpenSearchIssue: { openSearch: { name: string } } | null;
  // ... one nullable property per concrete type
}
```

#### Rules for interface fragments:

1. **No `__typename`** — use the type-keyed nullable properties as discriminators:

   ```typescript
   // Wrong — __typename doesn't exist on the flat fragment type
   if ($data.__typename === 'DeprecatedIngressIssue') { ... }

   // Correct — check the nullable type-keyed property
   if ($data.DeprecatedIngressIssue) { ... }
   ```

2. **Access type-specific fields via the type key**, not directly:

   ```typescript
   // Wrong — 'application' is not a top-level property
   if ('application' in d) return d.application.name;

   // Correct
   if ($data.DeprecatedIngressIssue) return $data.DeprecatedIngressIssue.application.name;
   ```

3. **Extract shared patterns** into derived values to reduce verbosity. Group types that share the same resource shape:

   ```typescript
   const workload = $derived(
   	$data.DeprecatedRegistryIssue?.workload ??
   		$data.FailedSynchronizationIssue?.workload ??
   		$data.VulnerableImageIssue?.workload
   );

   const resourceName = $derived(
   	$data.DeprecatedIngressIssue?.application.name ??
   		$data.OpenSearchIssue?.openSearch.name ??
   		workload?.name ??
   		'Unknown'
   );
   ```

4. **Derive `__typename` from the non-null key** when needed (e.g., for label lookups):

   ```typescript
   const issueTypeKeys = ['DeprecatedIngressIssue', 'OpenSearchIssue', ...] as const;
   const activeTypeName = $derived(
     issueTypeKeys.find((k) => $data[k] !== null && $data[k] !== undefined) ?? ''
   );
   ```

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

### Layout Utility Classes

Global utility classes defined in `src/styles/app.css` for common page patterns. **Use these instead of writing per-component layout CSS:**

- `.layout-two-column` — two-column grid (`1fr 300px`) with `--spacing-layout` gap. Collapses to single column at `≤1024px` (narrow desktop) and `≤767px` (mobile).
- `.layout-sidebar` — grid with `--ax-space-24` gap, `align-content: start`. Use for the sidebar column inside `.layout-two-column`.
- `.table-scroll` — horizontal scroll wrapper for wide tables. Wrap the `<Table>` with this instead of per-component overflow CSS.
- `.detail-actions` — right-aligned flex row for action buttons above content (e.g., edit/delete buttons).
- `.loading-centered` — centered flex container (300px height) for loading spinners.
- `.settings-list` — grid-based `<dl>` for key-value pairs (`18ch` label column + `1fr` value column). Collapses to stacked layout on mobile. Bold `dt` with `--ax-text-neutral-subtle` color.
- `.sidebar-toggle` — hidden by default, shown as `inline-flex` at `≤1024px`. Has `margin-left: auto` to stay right-aligned. Includes a chevron indicator via `::after`.

### CollapsibleSidebar Pattern

All list pages use `CollapsibleSidebar` (`$lib/ui/CollapsibleSidebar.svelte`) to handle filter visibility across breakpoints:

- **Wide desktop (>1024px):** Filters display in the right sidebar column (`.desktop-only`).
- **Narrow desktop / tablet (≤1024px):** Sidebar collapses. A "Filters" toggle button appears in the List header. Clicking it opens a right-side drawer overlay (uses `Modal`).
- **Mobile (≤767px):** Same drawer behavior.

#### Usage in list pages:

```svelte
<script lang="ts">
	import CollapsibleSidebar from '$lib/ui/CollapsibleSidebar.svelte';
	import { FunnelIcon } from '@nais/ds-svelte-community/icons';

	let filtersOpen = $state(false);
</script>

<div class="layout-two-column">
	<div>
		<List title="Items" count={items.length}>
			{#snippet actions()}
				<!-- Other action buttons (Create, Add, etc.) go FIRST -->
				<button
					type="button"
					class="sidebar-toggle"
					aria-expanded={filtersOpen}
					onclick={() => (filtersOpen = !filtersOpen)}
				>
					<FunnelIcon aria-hidden="true" style="font-size: 1rem" />
					Filters
				</button>
			{/snippet}
			<!-- list items -->
		</List>
	</div>
	<CollapsibleSidebar bind:open={filtersOpen}>
		<SurfaceCard title="Filters">
			<!-- filter components -->
		</SurfaceCard>
		{#snippet extras()}
			<!-- Optional: TeamActivityCard or other sidebar content -->
		{/snippet}
	</CollapsibleSidebar>
</div>
```

#### Rules:

1. **Filters button is always last** in the `{#snippet actions()}` — keeps it consistently on the far right
2. **`extras` snippet** is for content that shows in the sidebar on wide screens but below the list on narrow — never inside the drawer (e.g., TeamActivityCard)
3. **Do not use `<div class="layout-sidebar">`** for filter sidebars on list pages — use `CollapsibleSidebar` instead
4. **Container queries**: The `List` component's `.items` div has `container-type: inline-size`. Use `@container (max-width: 500px)` in list item components for reflow

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

Use `SurfaceCard` (`$lib/ui/SurfaceCard.svelte`) for **sidebar cards only**:

- Props: `title` (uppercase eyebrow label), `headerAside` (snippet), `bordered`
- Applies `--surface-elevated-background` and `--surface-elevated-shadow`
- Use for sidebar widgets, sidebar info panels, and dashboard overview panels
- **Never use in main content pane** — use `<section aria-labelledby>` + `<Heading>` instead

### Main Content Sections

For content in the main column (left side of `.layout-two-column`):

```svelte
<section aria-labelledby="my-section-heading">
	<Heading as="h2" size="small" id="my-section-heading">Section Title</Heading>
	<!-- section content -->
</section>
```

- Use `<section aria-labelledby>` for WCAG landmark navigation
- Use `<Heading>` with appropriate level (`h2` for top-level sections, `h3` for subsections)
- Separate sections with flex gap (`.main-column` with `gap: var(--ax-space-32)`)

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
3. **Utility classes first**: Use the layout utility classes (`.layout-two-column`, `.table-scroll`, etc.) before writing custom layout CSS
4. **Surface variables compose tokens**: The `--surface-*` variables are project-level abstractions built from `--ax-*` tokens — do not bypass them with raw color values
5. **Icons**: Import from `@nais/ds-svelte-community/icons` or `$lib/icons/` — never use inline SVGs
6. **Dark mode**: The surface system handles dark mode via CSS selectors on the root element; do not add separate dark-mode overrides for surface properties
7. **No hardcoded values**: Use `gap: var(--ax-space-8)` not `gap: 0.5rem`; use `border-radius: var(--ax-radius-medium)` not `border-radius: 8px`; use `color: var(--ax-text-neutral)` not `color: #333`

---

### CSS Architecture

Styles are organized with `@layer` ordering in `src/styles/app.css`:

```
@layer theme, base, components, utilities;
```

- `src/styles/app.css` — global variables, utility classes, surface system
- `src/styles/layerchart.css` — maps LayerChart `--color-*` variables to `--ax-*` tokens. **Must include a `.dark, .dark-theme` block** re-declaring the same mappings because `--ax-*` tokens resolve to different values inside dark-scoped elements.
- `src/styles/colors.css` — chart/visualization color palette (raw hex is acceptable here for data visualization)

#### LayerChart Dark Mode

The `layerchart.css` file has both a `:root` and a `.dark, .dark-theme` block with identical-looking declarations. **Do not remove the dark block** — CSS custom properties are scope-dependent. `var(--ax-neutral-000)` resolves to white at `:root` but to dark navy inside `.dark`, because the design system redefines tokens at that scope level.

---

## Responsive UI / Mobile

### Breakpoints

| Breakpoint | Target                  | Behavior                                                             |
| ---------- | ----------------------- | -------------------------------------------------------------------- |
| `>1024px`  | Wide desktop            | Two-column layout, sidebar visible                                   |
| `≤1024px`  | Narrow desktop / tablet | Single column, sidebar hidden, filter drawer via toggle button       |
| `≤767px`   | Mobile                  | Single column, compact spacing, container query reflow on list items |

### Guidelines

- New pages and substantial page changes must work on narrow mobile widths, not just desktop layouts.
- Use existing responsive patterns in the codebase before inventing route-specific mobile solutions.
- List pages must use `CollapsibleSidebar` for their filter sidebar (see Design Guidelines above).
- List item components should use `@container (max-width: 500px)` for reflow, not only `@media` queries — this responds to the actual list width, not viewport width.
- For wide data tables, prefer a horizontal scroll wrapper around the desktop table before introducing a separate mobile card view.
- Keep pagination outside horizontal scroll containers.
- Avoid blanket `white-space: nowrap` and large fixed `min-width` rules across entire tables; let value-heavy columns wrap and keep only the columns that need it non-wrapping.
- If tabs overflow on narrow screens, make the tab row horizontally scrollable and keep labels on a single line.

---

## Accessibility & WCAG Compliance

This project targets **WCAG 2.0 AA compliance** as a minimum standard.

All UI changes and accessibility work must meet this level:

- **Semantic HTML**: Use proper heading hierarchy (h1-h6 in logical order), semantic elements (`<button>`, `<a>`, `<nav>`, `<main>`, etc.), and avoid div soup
- **Heading structure**:
  - The page **h1** (job/app name) is provided by the layout/PageHeader component — do not duplicate it in page content
  - Page content starts with **h2** peer headings for main sections (e.g., "Job runs", "Configuration", "Deployments")
  - Subsections within those use **h3, h4** as appropriate (e.g., "Schedule" and "Next run" under Configuration)
- **Color contrast**: Ensure 4.5:1 contrast ratio for text and 3:1 for UI components (AA standard)
- **Focus indicators**: All interactive elements must have visible focus states; don't remove or hide native focus outlines without replacing them
- **Keyboard navigation**: All functionality must be accessible via keyboard; don't trap focus
- **ARIA labels**: Use `aria-label`, `aria-labelledby`, `aria-describedby` when semantic HTML isn't sufficient; especially for icon-only buttons
- **Empty states**: Use consistent patterns (see List component with ListItem for empty states)
- **Form fields**: Always associate labels with inputs; use semantic form elements
- **Icons**: Provide text alternatives; use `aria-label` for icon-only buttons
- **Link text**: Avoid "click here"; use descriptive link text that makes sense out of context

---

## Code Quality

### Before committing and pushing:

Run these checks in order (mirrors the CI pipeline in `.github/workflows/pr.yaml`):

1. `pnpm exec svelte-kit sync` — sync SvelteKit generated files
2. `pnpm run check` — Houdini generation + svelte-check (type check, `--fail-on-warnings`)
3. `pnpm run lint` — Prettier + ESLint
4. `pnpm run test -- --run` — run all tests
5. `helm lint --strict ./charts` — Helm chart validation (requires helm CLI)

All of these must pass before committing. If prettier reports issues, fix them with `pnpm run format` and include the formatting in the same commit.

### File Naming:

- Components: PascalCase (e.g., `MyComponent.svelte`)
- Routes: Lowercase with brackets for params (e.g., `[team]/+page.svelte`)
- Utilities: camelCase (e.g., `formatters.ts`)
- Tests: `*.test.ts`

---

## PR Review Comments

When asked to address Copilot (or other) review comments on a PR:

1. Fetch the review comments and implement the fixes
2. Commit and push the changes — **do this before replying or resolving**
3. Reply to **each** review comment thread individually with a short summary of what was done (or why no change was needed)
4. Resolve each review thread after replying

Do not post a single top-level PR comment summarizing all fixes — reply directly on each thread instead.

---

## Security & Elevation

This project has **elevation patterns** for accessing sensitive resources (e.g., secrets):

- Check `viewerCanElevate` before showing elevation UI
- Use elevation modals with justification
- Handle expiration timers with `$effect()`
- Always validate RBAC even if elevation metadata is stale
