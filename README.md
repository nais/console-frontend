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
```

### Mobile responsiveness

The console should remain usable at small viewport widths, with `375px` as the baseline mobile target.

When changing layouts, lists, tables, or chart-heavy pages, validate in responsive mode (for example `375x812`) and ensure:

- No page-level horizontal scrolling on mobile
- Horizontal overflow is scoped to the component that needs it (for example tables)
- Two-column desktop layouts collapse to one column on mobile where relevant
- Touch targets and controls remain usable without overlapping

### CSS Architecture

Styles use `@layer` ordering and design tokens from `@nais/ds-svelte-community`:

- **Tokens**: Use `--ax-space-*`, `--ax-radius-*`, `--ax-text-*` variables — never hardcode spacing, radii, or colors
- **Utility classes**: `src/styles/app.css` provides `.layout-two-column`, `.layout-sidebar`, `.table-scroll`, `.detail-actions`, `.loading-centered` for common patterns
- **LayerChart theming**: `src/styles/layerchart.css` maps chart library variables to design tokens. The `.dark` block must mirror the `:root` declarations (tokens resolve differently per scope)
- **Validation**: Run `pnpm run lint` — ESLint includes custom rules for missing CSS variables and unused GraphQL files

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

The **Logs** tab for applications and jobs uses the authenticated nais/api Loki proxy at
`/api/loki/api/v1/`. Local development forwards this path to `VITE_PROXY_ENDPOINT`, alongside
GraphQL; both nais/api and the local proxy must support Loki forwarding. The Postgres log
viewer is unchanged.

- Search, level, instance and label filters run automatically. Text inputs debounce for
  400 ms. Workload scope stays fixed, and historical instances remain searchable.
- Time presets range from 15 seconds to 7 days. Previous/next move by one complete window;
  **Jump to now** preserves its duration and restores a relative range. Times use the
  browser's time zone; fixed windows retain their exact UTC instants across daylight-saving
  transitions. Next-window availability updates as time advances without fetching logs.
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
