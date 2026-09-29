# Restoring Postgres in Console

The Postgres UI was temporarily removed while the CNPG API and resource model are being settled. The pre-removal implementation is available in git history (`git log --all -- src/routes/team/'[team]'/postgres src/routes/team/'[team]'/'[env]'/postgres`). Use it as a reference for workflows, not as a schema-compatible implementation.

## Previous workflows

- Team Postgres list: search, environment/state/label filters, sorting, pagination, and links to instances.
- Instance overview: configuration, workload references, utilization, Grafana link, and manifest example. Insights showed instance metrics. The delete flow checked workloads, required confirmation, and used a server action.
- Entry points: team navigation and inventory, admin team counts, global search and type suggestions, and persistence on application/job pages. Cloud SQL is a separate feature and must remain separate.
- Historical Postgres activity entries retain their text and icons while the UI is absent. Existing Postgres favorites are not migrated and may point to missing routes.

## Contract checks before restoring

[nais/api PR #526](https://github.com/nais/api/pull/526) describes an intermediate API change, **not** the final CNPG contract. Check the deployed API schema and product behavior before reusing any of the old operations:

1. Distinguish the logical Postgres resource from each physical instance. `TeamEnvironment.postgresInstance(name:)` takes an **instance name** in the proposed model, which can differ from the resource name after an active-instance change or recovery. Decide what list rows, detail routes, workload links, metrics, and deletion target and how users navigate between instances.
2. The old `PostgresInstanceFilter` and `PostgresInstanceFacets` used `majorVersions` and `highAvailability`; those fields disappear in PR #526. Rebuild URL filters, query variables, facet selections, and controls from the final schema, including pagination and sorting.
3. The old instance query selected `majorVersion`, `highAvailability`, and `resources` directly on `PostgresInstance`. PR #526 places configuration on `PostgresInstance.postgres`; check nullability and the final location of each field. The old instance-level `audit` and `maintenanceWindow` have no replacement in that proposal; do not restore their UI without an API source.
4. Recheck authorization, workload-use warnings, delete semantics, access flows, and activity events. In particular, do not assume that the former `grantPostgresAccess` mutation still exists.

## Reintroduction sequence

1. Confirm the final CNPG schema and pull the generated `schema.graphql` from an API running that version. Never edit the generated schema by hand. Regenerate Houdini types.
2. Restore the relevant list, detail, insights, and delete workflows from git history, adapting their GraphQL operations and route identities to the final contract.
3. Restore team navigation and inventory, admin counts, search, and application/job persistence together with the routes they link to. Revisit old favorite paths and historical activity links.
4. Verify first navigation and reload of list/detail pages, active-instance changes and recovery, permissions and deletion, search results, and metrics. Run `pnpm exec svelte-kit sync`, `pnpm run check`, `pnpm run lint`, and `pnpm run test -- --run`.
