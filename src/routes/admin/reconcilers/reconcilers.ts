import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `AdminReconcilers` query and `ReconcilerFragment` for the admin
 * reconcilers page.
 *
 * Mirrors the previous Houdini-based query in `query.gql` and the
 * inline `ReconcilerFragment` declared in `Reconciler.svelte`. The
 * three mutations (`enableReconciler`, `disableReconciler`,
 * `configureReconciler`) are colocated here and invoked from
 * `Reconciler.svelte` via `getContextClient().mutation(...)`.
 */
export const AdminReconcilersQuery = gql(/* GraphQL */ `
	query AdminReconcilers {
		reconcilers(first: 100) {
			nodes {
				id
				...ReconcilerFragment
			}
		}
	}
`);

export const ReconcilerFragment = gql(/* GraphQL */ `
	fragment ReconcilerFragment on Reconciler {
		id
		configured
		description
		displayName
		enabled
		name
		config {
			configured
			description
			displayName
			key
			value
			secret
		}
		errors {
			pageInfo {
				totalCount
			}
		}
	}
`);

export const EnableReconcilerMutation = gql(/* GraphQL */ `
	mutation EnableReconciler($name: String!) {
		enableReconciler(input: { name: $name }) {
			enabled
		}
	}
`);

export const DisableReconcilerMutation = gql(/* GraphQL */ `
	mutation DisableReconciler($name: String!) {
		disableReconciler(input: { name: $name }) {
			enabled
		}
	}
`);

export const SaveReconcilerConfigMutation = gql(/* GraphQL */ `
	mutation SaveReconcilerConfig($name: String!, $config: [ReconcilerConfigInput!]!) {
		configureReconciler(input: { name: $name, config: $config }) {
			configured
		}
	}
`);
