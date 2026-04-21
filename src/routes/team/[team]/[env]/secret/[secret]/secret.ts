import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `Secret` query for the secret detail page.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power `/team/[team]/[env]/secret/[secret]`. The
 * Houdini-only directives (`@cache`, `@with`, `@mask_disable`) are
 * dropped — the activity-log filter that was previously passed to
 * `SidebarActivityLogFragment @with(...)` has no urql equivalent, so
 * the default `SidebarActivityLogFragment` selection is used.
 */
export const SecretQuery = gql(/* GraphQL */ `
	query Secret($secret: String!, $team: Slug!, $env: String!) {
		me {
			... on User {
				isAdmin
			}
		}
		team(slug: $team) {
			viewerIsMember
			environment(name: $env) {
				secret(name: $secret) {
					id
					name
					teamEnvironment {
						environment {
							name
						}
					}
					keys
					workloads {
						nodes {
							id
							__typename
							name
							teamEnvironment {
								environment {
									name
								}
							}
							team {
								slug
							}
						}
					}
					lastModifiedAt
					lastModifiedBy {
						name
						email
					}
					...SidebarActivityLogFragment
				}
			}
		}
	}
`);

/**
 * `UpdateSecretValue` mutation, invoked when an editor saves a new
 * value for an existing key in the secret.
 */
export const UpdateSecretValueMutation = gql(/* GraphQL */ `
	mutation updateSecretValue(
		$name: String!
		$team: Slug!
		$env: String!
		$value: SecretValueInput!
	) {
		updateSecretValue(input: { environment: $env, name: $name, team: $team, value: $value }) {
			secret {
				id
				keys
				lastModifiedBy {
					name
					email
				}
				lastModifiedAt
			}
		}
	}
`);

/**
 * `RemoveSecretValue` mutation, invoked when an editor deletes a
 * single key from the secret.
 */
export const RemoveSecretValueMutation = gql(/* GraphQL */ `
	mutation removeSecretValue($name: String!, $team: Slug!, $env: String!, $valueName: String!) {
		removeSecretValue(
			input: { environment: $env, secretName: $name, team: $team, valueName: $valueName }
		) {
			secret {
				id
				keys
				lastModifiedBy {
					name
					email
				}
				lastModifiedAt
			}
		}
	}
`);

/**
 * `DeleteSecret` mutation, invoked when an editor deletes the entire
 * secret from the environment.
 */
export const DeleteSecretMutation = gql(/* GraphQL */ `
	mutation deleteSecret($name: String!, $team: Slug!, $env: String!) {
		deleteSecret(input: { name: $name, team: $team, environment: $env }) {
			secretDeleted
		}
	}
`);

/**
 * `AddSecretValue` mutation, invoked from the `AddKeyValue.svelte`
 * modal when an editor adds a new key/value pair to the secret.
 */
export const AddSecretValueMutation = gql(/* GraphQL */ `
	mutation addSecretValue($name: String!, $team: Slug!, $env: String!, $value: SecretValueInput!) {
		addSecretValue(input: { environment: $env, name: $name, team: $team, value: $value }) {
			secret {
				id
				keys
				lastModifiedBy {
					name
					email
				}
				lastModifiedAt
			}
		}
	}
`);

/**
 * `RevealSecretValues` mutation, invoked from `ViewSecretModal.svelte`
 * when an editor provides justification to view the actual secret
 * values. The previous `@cache(policy: NetworkOnly)` directive on the
 * Houdini document is dropped — urql doesn't cache mutations.
 */
export const RevealSecretValuesMutation = gql(/* GraphQL */ `
	mutation RevealSecretValues($input: ViewSecretValuesInput!) {
		viewSecretValues(input: $input) {
			values {
				name
				value
				encoding
			}
		}
	}
`);
