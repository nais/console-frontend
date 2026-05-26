# Console frontend

## Development

### Containerized Development (Recommended)

For enhanced security and isolation, we recommend using a containerized development environment:

#### VS Code Dev Containers

1. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Open the project in VS Code
3. Click "Reopen in Container" when prompted (or run command: `Dev Containers: Reopen in Container`)
4. The container will automatically install dependencies and configure allowed scripts
5. Use the integrated terminal in VS Code to run commands (all terminals opened in VS Code will run inside the container)

#### JetBrains IDEs (IntelliJ, WebStorm, etc.)

Use the built-in [Dev Containers support](https://www.jetbrains.com/help/idea/connect-to-devcontainer.html) available in recent versions.

#### Other Editors (Zed, Vim, etc.)

Manually use Docker to run the development environment:

```bash
# Use the devcontainer image directly
docker run -it -v $(pwd):/workspaces/console-frontend -w /workspaces/console-frontend -p 5173:5173 mcr.microsoft.com/devcontainers/javascript-node:22 bash

# Inside the container, run your development commands
pnpm install
pnpm run dev
```

#### Benefits

- Isolated development environment (protection against supply chain attacks)
- Consistent Node.js version across team
- Pre-configured extensions and settings (VS Code/JetBrains)
- All npm commands run in a secure, sandboxed environment

### Nix

For users with [Nix](https://nixos.org/) installed, you can use the provided flake for a reproducible development environment:

```bash
cd .configs
nix develop
```

This provides the same Node.js 22 and Git setup as the devcontainer. The flake is regularly updated to track the latest nixpkgs-unstable.

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

To connect to a nais-api instance, run the [nais CLI](https://github.com/nais/cli) proxy on your **host machine** (outside the devcontainer):

```bash
# On your host machine
nais auth login -n
nais alpha api proxy
```

Inside the devcontainer, update your `.env` to use `host.docker.internal` to access the host machine:

```bash
VITE_GRAPHQL_ENDPOINT="http://host.docker.internal:4242/graphql"
VITE_PROXY_ENDPOINT="http://host.docker.internal:4242"
VITE_SCHEMA_ENDPOINT="http://host.docker.internal:4242/graphql"
```

## Security Hardening

This project implements several security measures to protect against supply chain attacks:

### Lifecycle Script Control

pnpm v11 blocks lifecycle scripts by default (`blockExoticSubdeps=true`). Only packages listed in `pnpm-workspace.yaml` under `allowBuilds` can run lifecycle scripts.

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

The devcontainer automatically aliases `pnpm` to `npq-hero`, which provides interactive security checks before installing packages. When you run `pnpm add <package>` in the container, npq will:

- Check packages against known security vulnerabilities
- Verify package popularity and trustworthiness
- Alert you to suspicious patterns

**Note:** This alias only affects terminal sessions in the devcontainer.

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
