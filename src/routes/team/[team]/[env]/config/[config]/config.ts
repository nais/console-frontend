import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `Config` query for the config detail page.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power `/team/[team]/[env]/config/[config]`. The
 * Houdini-only directives (`@cache`, `@with`, `@mask_disable`) are
 * dropped — the activity-log filter that was previously passed to
 * `SidebarActivityLogFragment @with(...)` has no urql equivalent, so
 * the default `SidebarActivityLogFragment` selection is used.
 */
export const ConfigQuery = gql(/* GraphQL */ `
	query Config($config: String!, $team: Slug!, $env: String!) {
		me {
			... on User {
				isAdmin
			}
		}
		team(slug: $team) {
			viewerIsMember
			environment(name: $env) {
				config(name: $config) {
					id
					name
					teamEnvironment {
						environment {
							name
						}
					}
					values {
						name
						value
						encoding
					}
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
 * `UpdateConfigValue` mutation, invoked when an editor saves a new
 * value for an existing key in the config.
 */
export const UpdateConfigValueMutation = gql(/* GraphQL */ `
	mutation updateConfigValue(
		$name: String!
		$team: Slug!
		$env: String!
		$value: ConfigValueInput!
	) {
		updateConfigValue(
			input: { environmentName: $env, name: $name, teamSlug: $team, value: $value }
		) {
			config {
				id
				values {
					name
					value
					encoding
				}
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
 * `RemoveConfigValue` mutation, invoked when an editor deletes a
 * single key from the config.
 */
export const RemoveConfigValueMutation = gql(/* GraphQL */ `
	mutation removeConfigValue(
		$configName: String!
		$team: Slug!
		$env: String!
		$valueName: String!
	) {
		removeConfigValue(
			input: {
				environmentName: $env
				configName: $configName
				teamSlug: $team
				valueName: $valueName
			}
		) {
			config {
				id
				values {
					name
					value
					encoding
				}
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
 * `DeleteConfig` mutation, invoked when an editor deletes the entire
 * config from the environment.
 */
export const DeleteConfigMutation = gql(/* GraphQL */ `
	mutation deleteConfig($name: String!, $team: Slug!, $env: String!) {
		deleteConfig(input: { name: $name, teamSlug: $team, environmentName: $env }) {
			configDeleted
		}
	}
`);

/**
 * `AddConfigValue` mutation, invoked from the `AddKeyValue.svelte`
 * modal when an editor adds a new key/value pair to the config.
 */
export const AddConfigValueMutation = gql(/* GraphQL */ `
	mutation addConfigValue($name: String!, $team: Slug!, $env: String!, $value: ConfigValueInput!) {
		addConfigValue(input: { environmentName: $env, name: $name, teamSlug: $team, value: $value }) {
			config {
				id
				values {
					name
					value
					encoding
				}
				lastModifiedBy {
					name
					email
				}
				lastModifiedAt
			}
		}
	}
`);
