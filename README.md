# Console frontend

### Local Development

The following snippet contains the most important commands for development.

```bash
pnpm install
cp .env.example .env # Copy the example environment file
pnpm run build # Build the project
pnpm run dev # Starts a development server on port 5173

pnpm run check # Check for various issues
pnpm run lint # Lint the code
pnpm run format # Format the code (Or use a Prettier extension in  your editor)
pnpm run test # Run tests with Vitest
pnpm exec playwright install chromium # Install the browser for interaction tests
pnpm run test:browser # Run Playwright interaction tests
```

Browser tests start an isolated Vite server on port 4175 and do not require the API proxy.
ActionMenu uses Bits UI for menu behavior while the local wrappers own its styling and
native link/action callbacks. Its browser tests cover keyboard navigation, focus,
disabled items, radio groups, dialogs, themes and constrained viewports.
Modal and the filter drawer use Bits UI Dialog for focus, dismissal and scroll locking.
Modal renders a portaled element with `role="dialog"`, not a native `<dialog>`. Its
content stays mounted while closed, and `onBeforeClose` guards user dismissal without
blocking programmatic changes to `open`. Select stays native to preserve browser and
mobile selection, form submission and typed value bindings. Browser tests cover these
contracts, nested dialogs, guarded dismissal and drawer breakpoints.
The application shell provides a keyboard-visible **Skip to content** link to its single main landmark.

To run the home SSR/hydration network regression against an already-running console and API proxy,
use `CONSOLE_E2E_URL=http://127.0.0.1:5173 pnpm run test:browser home-network`. This runs only the live
home test, without starting the isolated fixture server, and requires a user with team memberships.

### Mobile responsiveness

The console should remain usable at small viewport widths, with `375px` as the baseline mobile target.

When changing layouts, lists, tables, or chart-heavy pages, validate in responsive mode (for example `375x812`) and ensure:

- No page-level horizontal scrolling on mobile
- Horizontal overflow is scoped to the component that needs it (for example tables)
- Two-column desktop layouts collapse to one column on mobile where relevant
- Touch targets and controls remain usable without overlapping

### CSS Architecture

Styles use `@layer` ordering and shared tokens in [shadcn.css](src/styles/shadcn.css) and [app.css](src/styles/app.css):

- **Tokens**: Use `--ax-space-*`, `--ax-radius-*`, `--ax-text-*` variables — never hardcode spacing, radii, or colors
- **Exact replacements**: Mechanical replacements must use existing, property-appropriate tokens of the same value. Do not round sizes or use spacing tokens for typography. Unmatched values, sizing changes, and new semantic tokens require design review.
- **Dimensions**: Use semantic size tokens for avatars, icons, and controls, not spacing tokens. Keep reviewed component-specific layout constraints as documented exceptions instead of adding single-use variables.
- **Readability**: Use shared typography tokens instead of page-specific small sizes. Body/table text is 15–16px, secondary text and controls 14px, and compact labels 12–13px. Keep text contrast at least 4.5:1 on its actual surface in both themes; `tests/browser/readability.spec.ts` covers shared status colours, tables, inputs, and navigation.
- **Utility classes**: `src/styles/app.css` provides `.layout-two-column`, `.layout-sidebar`, `.table-scroll`, `.detail-actions`, `.loading-centered` for common patterns
- **LayerChart theming**: `src/styles/layerchart.css` maps chart library variables to design tokens. The `.dark` block must mirror the `:root` declarations (tokens resolve differently per scope)
- **Validation**: Run `pnpm run lint` — ESLint checks missing CSS variables, exact existing token matches for literal `rem` spacing/typography/radii, and unused GraphQL files. Dimensions require semantic review; unmatched lengths and layout constraints are not rejected by the exact-match rule.

#### AI-Assisted Development

The project is configured with AI assistant guidelines and the Svelte MCP (Model Context Protocol) server:

- **[AGENTS.md](AGENTS.md)** — Project guidelines for AI assistants (GitHub Copilot, Cursor, Claude Code, etc.), covering Svelte 5 runes patterns, Houdini GraphQL conventions, CSS variable rules, component library usage, code quality standards, and security patterns.

- **Svelte MCP Server** — Provides Svelte 5 and SvelteKit documentation to AI assistants via the official remote endpoint at `https://mcp.svelte.dev/mcp`. In VS Code, it is available through the MCP server registry (no project config needed). For other editors (Cursor, Claude Code, Zed), it is configured in `.mcp.json`. Tools: `list-sections`, `get-documentation`, `svelte-autofixer`, `playground-link`.

#### Using the nais API proxy

To connect to a nais-api instance, run the [nais CLI](https://github.com/nais/cli) proxy on your **host machine**:

```bash
nais auth login -n
nais api proxy
```

Then set your `.env`:

```bash
GRAPHQL_ENDPOINT="http://localhost:4242/graphql"
VITE_PROXY_ENDPOINT="http://localhost:4242"
VITE_SCHEMA_ENDPOINT="http://localhost:4242/graphql"
```

### Log explorer

The **Logs** tab for applications, jobs and Postgres uses the authenticated nais/api Loki proxy at
`/api/loki/api/v1/`. Local development forwards this path to `VITE_PROXY_ENDPOINT`, alongside
GraphQL; both nais/api and the local proxy must support Loki forwarding.

- Search, level, instance and label filters run automatically. Text inputs debounce for
  400 ms. Workload scope stays fixed, and historical instances remain searchable.
- Postgres defaults to its active branch and also supports **All branches**. Branch
  selection excludes similarly named branches and pooler pods; instance filters narrow
  the selected branch rather than replacing its scope.
- Time presets range from 15 seconds to 7 days. Previous/next move by one complete window;
  **Jump to now** preserves its duration and restores a relative range. Times use the
  browser's time zone; fixed windows retain their exact UTC instants across daylight-saving
  transitions. Next-window availability updates as time advances without fetching logs.
  Switching to **Custom range** preserves the UTC instant of each endpoint until that
  field is edited.
- **Settings** contains auto-refresh (off by default), page size, wrapping, sorting,
  **Show query**, and external links. Relative ranges advance on refresh; fixed ranges do
  not. Auto-refresh replaces loaded pages.
- **Show query** reveals the executed LogQL and editor. Advanced edits require **Run query**;
  time navigation, custom range and page-size changes preserve the executed query rather
  than running an unsaved draft.
  **Use filters** restores automatic filter-based queries.
- Expanded entries show the full message, copy action and labels. Include/exclude actions
  add removable label filters; they are unavailable in advanced mode. Job-run links
  automatically use pod-name prefixes (including complete pod names), while manually
  selected instances match exactly. Expanded details render only while a row is open.
- Label filters run after JSON parsing, which remains enabled while any label filters
  are active, even with no log-level filter selected.
- The collapsible timeline counts the same matching lines, including non-JSON logs.
  Selecting a bar zooms into that interval; **Load older logs** stays within the selected
  range. Pagination preserves nanosecond timestamp boundaries and fails explicitly if a
  boundary exceeds Loki's 5000-line limit instead of silently skipping lines.

Workloads without a Loki destination show an explanatory message. Secure log destinations
are not exposed through this viewer. Late-arriving logs may require refreshing the query.

## Security Hardening

This project implements several security measures to protect against supply chain attacks:

### Lifecycle Script Control

pnpm v11 blocks lifecycle scripts by default. Only packages listed in `pnpm-workspace.yaml` under `allowBuilds` can run lifecycle scripts.

### Dependency Update Policy

pnpm enforces a 14-day cooldown period via `minimumReleaseAge: 20160` in `pnpm-workspace.yaml`. Only packages published at least 14 days ago are eligible for installation, reducing the risk of newly compromised packages.

To check for available updates:

```bash
pnpm run check-outdated
```

To update outdated dependencies (respects 14-day cooldown):

```bash
pnpm run update-outdated
```
