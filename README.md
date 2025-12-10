# Console frontend

📚 **[View Component Library (Storybook)](https://nais.io/console-frontend/)**

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
docker run -it -v $(pwd):/workspaces/console-frontend -w /workspaces/console-frontend -p 5173:5173 -p 6006:6006 mcr.microsoft.com/devcontainers/javascript-node:22 bash

# Inside the container, run your development commands
npm install && npx allow-scripts auto
npm run dev
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
npm install
cp .env.example .env # Copy the example environment file
npm run build # Build the project
npm run dev # Starts a development server on port 5173

npm run check # Check for various issues
npm run lint # Lint the code
npm run format # Format the code (Or use a Prettier extension in  your editor)
npm run test # Run tests with Vitest
npm run lockfile-lint # Validate package-lock.json security
```

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

- **`.npmrc`**: Contains `ignore-scripts=true` to disable all lifecycle scripts (preinstall, install, postinstall) by default
- **`@lavamoat/allow-scripts`**: Explicitly allowlists packages that need to run lifecycle scripts
- **`@lavamoat/preinstall-always-fail`**: Prevents accidental script execution during development

Only packages listed in `package.json` under `lavamoat.allowScripts` can run lifecycle scripts. To update the allowlist:

```bash
npm run allow-scripts
```

### Dependency Update Policy

- **`.ncurc.cjs`**: Configures `npm-check-updates` with a 14-day cooldown period
- Only allows updates to packages published at least 14 days ago
- Reduces risk of compromised packages with malicious updates

To check and/or update dependencies (with interactive selection):

```bash
npm run check-outdated-interactive
```

### Lockfile Validation

- **`lockfile-lint`**: Validates `package-lock.json` integrity
- Runs in CI/CD to detect tampering or unexpected changes

To manually validate the lockfile:

```bash
npm run lockfile-lint
```

### Package Installation Security (npq)

The devcontainer automatically aliases `npm` to `npq-hero`, which provides interactive security checks before installing packages. When you run `npm install <package>` in the container, npq will:

- Check packages against known security vulnerabilities
- Verify package popularity and trustworthiness
- Alert you to suspicious patterns

**Note:** This alias only affects terminal sessions in the devcontainer. If you need to bypass npq for any reason, use the full path:

```bash
/home/vscode/.local/share/mise/installs/node/24.11.0/bin/npm install <package>
```

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
