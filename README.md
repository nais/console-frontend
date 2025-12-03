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

## Dependency Management

This project uses enhanced security measures for dependency management:

- **Lifecycle scripts disabled**: `.npmrc` disables `preinstall`, `install`, and `postinstall` scripts by default to protect against supply chain attacks that abuse these hooks. Only explicitly allowed packages (via `@lavamoat/allow-scripts`) can run scripts.
- **npm-check-updates**: Configured with a 14-day cooldown period to filter out updates for packages published within the last 14 days (see `.ncurc.cjs`). This is a policy for updating dependencies to reduce risk, not a security enforcement mechanism—direct installation or transitive dependencies may still include recently published packages.
- **lockfile-lint**: Validates package-lock.json for security issues - HTTPS, integrity checks, hostname verification (see `.lockfile-lintrc.json`)
- **npq**: Recommended for package installation to check for security issues before installing

```bash
npx npm-check-updates -i # Update dependencies interactively (respects 14-day cooldown)
npm run lockfile-lint # Validate lockfile security
npm run allow-scripts # View/manage which packages can run lifecycle scripts
```

### Managing lifecycle scripts

If you need to allow a new package to run scripts:

```bash
# Automatically detect and add packages that need scripts
npx allow-scripts auto

# Or manually add to package.json lavamoat.allowScripts configuration
```

### Using npq for safer installations

We recommend using [npq](https://github.com/lirantal/npq) instead of `npm install` to scan packages for security issues before installation:

```bash
# Install npq globally
npm install -g npq

# Alias npm to npq (add to your shell config: ~/.zshrc, ~/.bashrc, etc.)
alias npm='npq-hero'

# Now when you run npm install, it will use npq automatically
npm install <package-name>
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
