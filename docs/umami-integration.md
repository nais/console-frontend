# Plan: Integrate Umami/Sporing Analytics

## Summary

Add NAV's ResearchOps "sporing" tracking script to console-frontend. This provides privacy-first analytics (no cookies, GDPR compliant) with automatic page view tracking and custom event tracking for key user actions. Data flows through NAV's event proxy to BigQuery.

## Prerequisites

1. Request website registration in Slack `#researchops` — provide: app name ("Console"), domain, team name
2. Get tracking codes from `innblikk.ansatt.nav.no/sporingskoder` (prod) and `innblikk.ansatt.dev.nav.no/sporingskoder` (dev)

## Steps

### Phase 1: Chart & Server Configuration

1. **Add tracking flag to Helm chart** — New values in `charts/Feature.yaml` and `charts/values.yaml`:
   - `tracking.enabled` (boolean, default `false`) — opt-in per tenant
   - `tracking.websiteId` (string) — the Umami/Innblikk website UUID
   - Add env vars `TRACKING_ENABLED` and `TRACKING_WEBSITE_ID` to `charts/templates/deployment.yaml`

2. **Pass tracking config to client via layout** — In `src/hooks.server.ts`, read `TRACKING_ENABLED` and `TRACKING_WEBSITE_ID` from env, expose via `event.locals`. In `src/routes/+layout.server.ts`, pass to page data. This follows the existing pattern for `tenantName` and `githubOrganization`.

### Phase 2: Script Integration

3. **Conditionally inject tracking script** — In `src/routes/+layout.svelte` `onMount`, dynamically create and append the `<script>` tag when `data.trackingEnabled` is true. Uses `sporing-dev.js` when `data.trackingDev` is true, otherwise production `sporing.js`.

4. **Add `beforeSend` function** — Assigned to `window.beforeSend` in `onMount`. Replaces resolved URLs with SvelteKit route IDs (e.g. `/team/[team]/secrets`) for aggregate page analytics. Route ID is kept in sync via `afterNavigate`.

5. **Add TypeScript type declarations in `src/app.d.ts`** — Declare `window.sporing` with `track()` and `identify()` methods so custom event calls are type-safe. Update `App.Locals` and layout data types for tracking config.

### Phase 3: Custom Event Tracking

6. **Create a tracking utility module `src/lib/tracking.ts`** — Thin wrapper around `window.sporing.track()` that:
   - Checks if `window.sporing` exists (guards against script not loaded, local dev, tests)
   - Exposes typed `trackEvent(name: string, data?: Record<string, string | number | boolean>)` function
   - No-ops gracefully if tracking unavailable

7. **Add event tracking to key user actions** — Import and call `trackEvent()` after successful actions. Start with Tier 1 (highest insight value):
   - **Favourites**: `favorite-add`, `favorite-remove`, `favorite-reorder`, `favorite-click` — in `src/lib/ui/AddToFavorites.svelte`, `src/lib/domain/list-items/FavoritesListItem.svelte`, `src/routes/FavoritesList.svelte`. Include `{ pageType }` extracted from path (app, job, secret, etc.) — not the full path or resource name.
   - **Team lifecycle**: `ConfirmTeamDeletion` — in `src/routes/team/[team]/settings/confirm_delete/+page.svelte`
   - **App lifecycle**: `RestartApp`, `StopApp`, `DeleteApplication` — in `src/routes/team/[team]/[env]/app/[app]/AppActions.svelte`, `src/routes/team/[team]/[env]/app/[app]/delete/+page.svelte`
   - **Secret access**: `RevealSecretValues` — in `src/routes/team/[team]/[env]/secret/[secret]/ViewSecretModal.svelte`
   - **Job triggers**: `TriggerJobRun` — in `src/routes/team/[team]/[env]/job/[job]/JobActions.svelte`
   - **Vulnerability mgmt**: `SuppressFinding` — in `src/lib/domain/vulnerability/SuppressFinding.svelte`

   Track only event name + resource type (e.g., `{ type: 'app' }`). No user identifiers, no resource names.

### Phase 4: Development & Testing Setup

8. **Dev script variant** — In the `svelte:head` block, conditionally use `sporing-dev.js` (proxy: `reops-event-proxy.ekstern.dev.nav.no`) for non-production. Controlled by `TRACKING_DEV` env var.

9. **Disable tracking in tests** — Set `localStorage.setItem('sporing.disabled', '1')` in E2E/Playwright setup.

## Decisions

- **Multi-tenant**: Tracking is opt-in per tenant via Helm chart flag (`tracking.enabled`). Disabled by default — only enabled for NAV where no consent is required
- **No consent UI**: Console for NAV is an internal ansatte tool — cookie consent not required per ResearchOps guidance
- **No user identification**: Fully anonymous tracking, no `sporing.identify()` calls
- **URLs sent with paths intact**: Team/app/env names in URLs are organizational identifiers, not PII
- **Query params stripped**: Search terms and filter values removed via `data-before-send`
- **No CSP changes needed currently**: No CSP headers are configured; if CSP is added later, allowlist `cdn.nav.no` (script-src) and `reops-event-proxy.nav.no` + `reops-event-proxy.ekstern.dev.nav.no` (connect-src)
- **Server-side mutations**: For mutations in `+page.server.ts` (form actions), tracking must happen client-side after the form action succeeds

## References

- [ResearchOps sporing docs](https://reops-docs.ansatt.dev.nav.no/innsamling/sporingsskript/)
- [Getting started guide](https://reops-docs.ansatt.dev.nav.no/guider/kom-i-gang-med-sporing/)
- Dashboard: `innblikk.ansatt.nav.no` (prod) / `innblikk.ansatt.dev.nav.no` (dev)
- BigQuery: `team-researchops-prod-01d6.umami_views.event`
- Slack: `#researchops`
