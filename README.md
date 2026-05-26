# Console frontend

## Development

### Nix

For users with [Nix](https://nixos.org/) installed, you can use the provided flake for a reproducible development environment:

```bash
cd .configs
nix develop
```

This provides Node.js 24, pnpm, and Git. The flake is regularly updated to track the latest nixpkgs-unstable.

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

- **[AGENTS.md](AGENTS.md)** - Project guidelines for AI assistants (GitHub Copilot, Cursor, Claude Code, etc.)
  - Svelte 5 runes patterns
  - Houdini GraphQL conventions
  - CSS variable validation rules
  - Component library usage
  - Code quality standards
  - Security patterns

- **Svelte MCP Server** - Provides comprehensive Svelte 5 and SvelteKit documentation to AI assistants
  - Configuration: `.mcp.json` (Cursor, Claude Code, Zed) and `.vscode/mcp.json` (VSCode)
  - Remote endpoint: `https://mcp.svelte.dev/mcp`
  - Tools: `list-sections`, `get-documentation`, `svelte-autofixer`, `playground-link`

The MCP server helps AI assistants provide accurate, up-to-date Svelte 5 guidance and catch common issues before you run linters.

#### Using the nais API proxy

To connect to a nais-api instance, run the [nais CLI](https://github.com/nais/cli) proxy on your **host machine**:

```bash
nais auth login -n
nais alpha api proxy
```

Then set your `.env`:

```bash
VITE_GRAPHQL_ENDPOINT="http://localhost:4242/graphql"
VITE_PROXY_ENDPOINT="http://localhost:4242"
VITE_SCHEMA_ENDPOINT="http://localhost:4242/graphql"
```

## Security Hardening

This project implements several security measures to protect against supply chain attacks:

### Lifecycle Script Control

pnpm v11 blocks lifecycle scripts by default. Only packages listed in `pnpm-workspace.yaml` under `allowBuilds` can run lifecycle scripts.

### Dependency Update Policy

- **`check-updates-cooldown.mjs`**: Enforces a 14-day cooldown period for dependency updates
- Only allows updates to packages published at least 14 days ago
- Reduces risk of compromised packages with malicious updates

To check for outdated dependencies:

```bash
pnpm run check-outdated
```

To update outdated dependencies (respects 14-day cooldown):

```bash
pnpm run update-outdated
```

To check when a specific package version was published:

```bash
pnpm run check-age <package-name> <version>
```

### Package Installation Security (npq)

Use `pnpm dlx npq install` (or `pnpm run install-safe`) to run interactive security checks before installing packages.

## User

In production `api` uses oauth2 to authenticate users.

### Local user override

When running locally, the frontend will proxy requests to the locally running [backend](https://github.com/nais/api) through a Vite Proxy.
This proxy will add a special header for local development to specify which user to run as.

There's two well known users:

| User                        | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| `dev.usersen@example.com`   | A user with tenant wide permissions, but owns a team |
| `admin.usersen@example.com` | A user with all permissions                          |

You can specify which user to run as through `.env`.
See `.env.example` for an example.

## Code generated by GitHub Copilot

This repository uses GitHub Copilot to generate code.

## Logging

The application uses [Pino](https://github.com/pinojs/pino) for structured JSON logging.

- **Development**: Human-readable logs with colors via `pino-pretty`
- **Production**: Structured JSON logs to stdout

Set `LOG_LEVEL` environment variable to control verbosity (trace, debug, info, warn, error, fatal). Default is `info`.

Server-side code should use the logger:

```typescript
import { logger } from '$lib/logger';

logger.info({ userId: 123 }, 'User logged in');
logger.error({ error, context: 'some-context' }, 'An error occurred');
```

HTTP requests are automatically logged in `hooks.server.ts` (errors and slow requests only).
