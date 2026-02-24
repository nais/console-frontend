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

## Common Commands

| Task              | Command          |
| ----------------- | ---------------- |
| Run locally       | `npm run dev`    |
| Build             | `npm run build`  |
| Type check        | `npm run check`  |
| Lint              | `npm run lint`   |
| Format code       | `npm run format` |
| Run tests         | `npm run test`   |
| Validate CSS vars | `npm run unused` |

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
- This list is not exhaustive; follow existing spacing tokens in the codebase and rely on `npm run unused` to validate new usages

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

1. **Before using ANY CSS variable**, search the codebase first for existing usage patterns. For new tokens, verify they exist in the @nais/ds-svelte-community design system or rely on `npm run unused` for validation
2. **Never invent** CSS variable names like `--ax-font-family-mono`, `--ax-color-*`, etc.
3. **For font-family**: Use `font-family: monospace` directly (not a CSS variable)
4. **For spacing**: Use the predefined spacing scale, not arbitrary values
5. **Run validation**: The project has `npm run unused` which includes `find-missing-css-vars.mjs` - this validates CSS variables
6. **When in doubt**: Search existing `.svelte` and `.css` files for similar patterns before creating new styles
7. **Lists are non-exhaustive**: The design system has more tokens than listed here; use validation scripts to confirm

---

## Svelte 5 Runes

This project uses **Svelte 5 with runes mode** (enforced via `forceRunesMode: true` in Houdini config).

### Required Patterns:

- Use `$state()` for reactive state (not `let` with reactivity)
- Use `$derived()` for computed values (not `$:`)
- Use `$effect()` for side effects (not `$:` statements)
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

## Code Quality

### Before submitting code:

1. **Run linting**: `npm run lint` (Prettier + ESLint)
2. **Type check**: `npm run check` (includes Houdini generation + svelte-check)
3. **Validate CSS vars**: `npm run unused` (checks for missing CSS vars and unused GraphQL)
4. **Test utilities**: Unit tests exist in `*.test.ts` files using Vitest

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
