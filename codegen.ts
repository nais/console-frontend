import type { CodegenConfig } from '@graphql-codegen/cli';

/**
 * GraphQL Code Generator configuration.
 *
 * Uses the `client` preset to generate a strongly-typed `graphql()` function
 * that can be used together with urql. Documents written through this function
 * automatically infer their result and variables types from the schema.
 *
 * Run with `npm run codegen` (or `npm run codegen:watch`).
 */
const config: CodegenConfig = {
	schema: './schema.graphql',
	// Scan all `.ts` and `.svelte` files under `src/`.
	//
	// Houdini's Vite plugin is no longer wired into `vite.config.ts`, so it
	// can't intercept calls or cause duplicate-operation errors here. There
	// are still some `.svelte` files that import `graphql` from `$houdini`
	// while we finish migrating; to keep the generator from picking those up
	// (which would emit duplicate-operation errors against operations that
	// only exist in `.houdini/`), the GraphQL Tag Pluck step is locked to
	// only extract calls to the urql-typed helper, which we always import
	// under the alias `gql` from `$lib/urql/gql`.
	//
	// Once every `.svelte` and `.ts` file has stopped importing from
	// `$houdini` (Phase 4), the `pluckConfig.modules` restriction can be
	// dropped and the alias collapsed back to `graphql`.
	documents: ['src/**/*.ts', 'src/**/*.svelte', '!src/lib/urql/gql/**/*', '!src/**/*.d.ts'],
	ignoreNoDocuments: true,
	pluckConfig: {
		// Only extract calls to `gql(...)` (which we always alias the
		// generated `graphql` helper to via `import { graphql as gql }`).
		// The default identifier list also includes `graphql`, which would
		// pick up Houdini's `graphql\`...\`` template tags in `.svelte`
		// files that are still pending migration. Locking this to a single
		// identifier name keeps codegen scoped to urql operations only.
		globalGqlIdentifierName: ['gql'],
		modules: [
			{
				name: '$lib/urql/gql',
				identifier: 'graphql'
			}
		]
	},
	generates: {
		'./src/lib/urql/gql/': {
			preset: 'client',
			config: {
				useTypeImports: true,
				// Keep generated TypeScript enum member names identical to the
				// underlying GraphQL schema values (SCREAMING_SNAKE_CASE) so
				// existing call sites that were written against Houdini's
				// `EnumName.VALUE` style keep working without renames during
				// the migration. Without this, the `client` preset converts
				// values to PascalCase (e.g. `OrderDirection.Asc`).
				namingConvention: {
					enumValues: 'keep'
				},
				// Map custom scalars to TypeScript types so generated code lines up
				// with how the rest of the app already treats these values.
				scalars: {
					Slug: 'string',
					Cursor: 'string',
					Date: 'string',
					Time: 'string',
					TimeOfDay: 'string'
				}
			}
		}
	}
};

export default config;
