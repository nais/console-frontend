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

The profile button with the user avatar and a chevron opens the user settings menu.
It offers **Color theme** choices (Light and Dark), followed by **Log out**.
Theme preferences use the existing `theme` cookie. Text size is controlled by browser zoom
(Cmd+/Cmd- on macOS, Ctrl+/Ctrl- on other platforms), not a separate profile preference.
Typography, controls, and spacing use rem-based tokens.

To run the home SSR/hydration network regression against an already-running console and API proxy,
use `CONSOLE_E2E_URL=http://127.0.0.1:5173 pnpm run test:browser home-network`. This runs only the live
home test, without starting the isolated fixture server, and requires a user with team memberships.

### Legacy deploy

Fasit's management environment value `legacyDeployDisabled` is passed to Console as
`LEGACY_DEPLOY_DISABLED`. Missing or empty values default to `false`; otherwise only
`true` and `false` are accepted.

When `true`, Console hides legacy deploy keys and deployment history, omits legacy
GraphQL fields, and redirects team and workload deployment-history routes to their
overviews. Activity logs and modern deployment metadata remain available.

### Production assets

Production builds use `ASSET_BASE_URL` to load client assets from
`https://cdn.nais.io/console/<run-id>-<run-attempt>`. Without this build argument,
assets are served locally as before.

The main workflow extracts `client/` from the published Docker image and uploads
it to `gs://nais-io-cdn-assets/console/<run-id>-<run-attempt>` using the dedicated
`gh-console-frontend-assets` identity. Uploads are create-only and retain previous
releases. Precompressed files and source maps are excluded. All uploaded files use
long-lived immutable caching because each build has its own prefix.

Chart publication is blocked until upload succeeds and a client entry point fetched
through the CDN matches the image's file. The first CDN-backed release cannot repair
tabs opened before this change; those still need a refresh after their old pods stop.

Version detection deliberately requests `/_app/version.json` from the tenant's
server, not the release-pinned CDN. After navigation, a different version enables
the update notification. Failed navigation can trigger a full page load, limited
to once per loaded version per tab, even if requests alternate between builds
during a rolling update.

#### CDN monitoring

Set `alerts.cdn.enabled: true` in Fasit for exactly one management environment
with Alloy and Alertmanager. The chart adds a probe of
`https://cdn.nais.io/console/health.js` every minute and alerts after three minutes
of failures or ten minutes without metrics. Check that the selected environment
reports `probe_success` for `probe/nais-system/<release>-cdn`. The alerts use
standard Alertmanager routing without an explicit on-call ping.

The shared `http_2xx` module checks HTTPS availability from that environment.
It does not check the body marker, CORS, or files from the active release. CI
still verifies the published entry point before releasing the chart.

### Mobile responsiveness

The console should remain usable at small viewport widths, with `375px` as the baseline mobile target.
Collapsed desktop sidebar links use themed tooltips to the right on hover and keyboard focus.
Expanded sidebar and mobile navigation links retain their text labels without tooltips.

When changing layouts, lists, tables, or chart-heavy pages, validate in responsive mode (for example `375x812`) and ensure:

- No page-level horizontal scrolling on mobile
- Horizontal overflow is scoped to the component that needs it (for example tables)
- Two-column desktop layouts collapse to one column on mobile where relevant
- Touch targets and controls remain usable without overlapping

### CSS Architecture

Styles use `@layer` ordering and shared [UI tokens](packages/ui/src/lib/tokens.css).
Console-specific tokens and rules remain in [shadcn.css](src/styles/shadcn.css) and [app.css](src/styles/app.css):

- **Tokens**: Use `--sh-font-*` for typography, `--nais-space-*` for spacing, `--nais-radius-*` and `--radius-*` for radii, and semantic tokens such as `--foreground`, `--card`, `--border`, and `--destructive` for colors. Fixed palette colors use `--nais-blue-*`, `--nais-purple-*`, and `--nais-magenta-*`; breakpoints use `--nais-breakpoint-*`. Typography has one canonical token set; semibold is 600 and bold is 700.
- **Exact replacements**: Mechanical replacements must use existing, property-appropriate tokens of the same value. Do not round sizes or use spacing tokens for typography. Unmatched values, sizing changes, and new semantic tokens require design review.
- **Dimensions**: Use semantic size tokens for avatars, icons, and controls, not spacing tokens. Keep reviewed component-specific layout constraints as documented exceptions instead of adding single-use variables.
- **Readability**: Use shared typography tokens instead of page-specific small sizes. Body/table text uses 0.9375rem, controls use 0.9rem, and compact labels use 0.75–0.85rem. Keep text contrast at least 4.5:1 on its actual surface in both themes; `tests/browser/readability.spec.ts` covers shared status colours, tables, inputs, and navigation.
- **Utility classes**: `src/styles/app.css` provides `.layout-two-column`, `.layout-sidebar`, `.table-scroll`, `.detail-actions`, `.loading-centered` for common patterns
- **LayerChart theming**: `src/styles/layerchart.css` maps chart library variables to design tokens. The `.dark` block must mirror the `:root` declarations (tokens resolve differently per scope)
- **Validation**: Run `pnpm run lint` — ESLint checks missing CSS variables, exact existing token matches for literal `rem` spacing/typography/radii, and unused GraphQL files. Dimensions require semantic review; unmatched lengths and layout constraints are not rejected by the exact-match rule.

### Shared UI package

[packages/ui](packages/ui) is the `@nais/ui` workspace package. Console stays at the
repository root and consumes it through `workspace:*`; its existing UI barrel also
preserves the `ShButton` alias. Build, check, dev and browser-test commands build
the package first. For live package edits, run `pnpm --filter @nais/ui exec svelte-package --watch`
alongside the app.

Public components are `Alert`, `Button`, `ErrorMessage`, `Heading`, `HelpText`,
`Label`, `Modal`, `ReadMore`, `Select`, `Skeleton`, `Table`, `Tag`, `Tbody`, `Td`,
`TextField`, `Th`, `Thead`, `Theme`, `Tooltip` and `Tr`. Each exports a corresponding
`*Props` type; `ModalHeaderProps`, `TableSortState` and `TagVariant` are also public.
Console's existing UI barrel re-exports these implementations and retains the
`ShAlert`, `ShButton` and `ShSkeleton` aliases. Loader and Detail remain private.

`TextField` supports native text, numeric and time inputs; `Select` stays native
and preserves typed option values. Both include labels, descriptions and validation
messages without depending on Console utility classes. `HelpText` uses a Bits UI
popover with Escape/outside-click dismissal, focus restoration and viewport collision
handling. Help and tooltip portals retain their containing dialog and theme.
Tooltip's `bind:open` reflects hover, focus and dismissal, and supports external updates.
`ReadMore` supports controlled, bound and default-open state, including SSR.
`defaultOpen` sets only the initial state; use `open` to control it after mounting.
Tables support compact sizing, striped rows, sticky headers and sortable headings.
`Skeleton` accepts dimensions, HTML attributes and text/circle/rectangle variants,
and disables animation when reduced motion is requested.
`StatusIndicator` provides static status dots with `success`, `danger`, `warning`,
`info` and `neutral` tones. Supply `label` for an accessible description and a
keyboard-accessible tooltip; omit it when adjacent text describes the decorative
dot. `compact` removes the surrounding layout space without changing the 8px core
or 2px muted ring, and `tone={null}` renders nothing. Applications own status-to-tone
mapping and wording.

In another Svelte 5 app, import the components from `@nais/ui` and load CSS once:

```css
@layer theme, base, components, utilities;
@import '@nais/ui/tokens.css' layer(components);
@import '@nais/ui/theme.css';
```

`tokens.css` contains shared spacing/radius/typography scales, semantic palettes,
shadows and primitive component dimensions. `theme.css` preserves Lucide sizing in
the components layer and the unlayered, zero-specificity light/dark color-scheme
selectors. Console imports tokens through its existing layered `shadcn.css` and
theme rules through `app.css`. Keep this order and layering when integrating elsewhere.
Both explicit nested themes and theme-scoped modal portals are supported.

Hosts own box sizing, root font size, font loading, body styling and layout.
Console's page/sidebar/chart tokens, utility classes, navigation, LayerChart mappings,
global links and body rules stay in Console. Theme preference persistence is not
part of the package.

The package requires Svelte `^5.57.3` as a peer; Bits UI and Lucide are declared
runtime dependencies. `@sveltejs/package` generates distributable Svelte files and
TypeScript declarations without Console aliases or a SvelteKit runtime dependency.

```bash
pnpm --filter @nais/ui build
pnpm --dir packages/ui pack --pack-destination "$TMPDIR"
pnpm run test:package
```

`test:package` packs the library, installs the tarball into a temporary copy of the
[minimal Svelte consumer](tests/package-consumer) outside the workspace, checks
types, and builds client and SSR outputs. It removes its temporary files on exit.
The same consumer is exercised by `pnpm run test:browser ui-package` without Console
CSS, covering form bindings, table styling, feedback and themed dialog overlays.
No registry publication is performed. Consumers must reconcile existing component
APIs, visual defaults, CSS layers and host styles, then validate their own themes
and portals. The library extension does not migrate doc or m8e.

#### Versioning and distribution

`@nais/ui` is distributed through the same public Google Artifact Registry as
`@nais/ds-svelte-community`, not through npmjs.org. Its `publishConfig` pins the
destination to prevent publishing to the wrong registry.

Consumers need this scope mapping in their project `.npmrc` (already present in Console):

```ini
@nais:registry=https://europe-north1-npm.pkg.dev/nais-io/nais-public-npm/
```

Once the first release has been published, doc can replace the pilot tarball with:

```bash
pnpm add --save-exact @nais/ui@0.1.0
```

The registry grants public read access; consumers do not need a publishing token.
Console itself keeps using `workspace:*`.

For changes to the shared package, run `pnpm changeset`, select `@nais/ui`, choose
the version bump, and commit the generated changeset with the implementation.
App-only changes do not need a UI changeset. The initial minor changeset moves the
unpublished `0.0.1` package to `0.1.0`; later fixes use patch bumps, while additive
features and breaking changes during `0.x` should use minor bumps.
The CLI stays on Changesets 2 while the release action relies on its `New tag:`
output to create GitHub releases; validate that integration before upgrading to CLI 3.

[Release UI package](.github/workflows/ui-release.yaml) runs on relevant changes to
`main` and can also be dispatched manually on `main`. It validates the code and packed
consumer before using Changesets to create or update a draft release PR. The PR contains
the package version, changelog, consumed changesets and any lockfile update; it does not
version or publish the private Console app.

Mark the release PR **Ready for review** as a human after each bot update. This triggers
the normal PR checks through `ready_for_review`, even though the release PR is created
with `GITHUB_TOKEN` (bot-created events do not trigger another workflow). Bot updates
return the PR to draft so the new version is checked again. Review and merge only after
the checks pass.

After the release PR merges, the next release run publishes unpublished versions and
creates a package tag/GitHub release, such as `@nais/ui@0.1.0`. Published versions are
immutable; further changes require another changeset. Re-running the workflow skips
versions that are already published.

Publishing uses GitHub OIDC and `gh-console-frontend@nais-io.iam.gserviceaccount.com`,
with `roles/artifactregistry.writer` on `nais-public-npm`. A short-lived access token
is referenced from a temporary npm config and removed after the action; no static npm
token or service-account key is stored in the repository. Terraform manages the IAM
binding; it must be applied before publishing. No package is published merely by
installing dependencies, building Console, or running `test:package`.

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
- Postgres logs are scoped to the database by the API. Instance filters narrow
  that scope to selected pods.
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
