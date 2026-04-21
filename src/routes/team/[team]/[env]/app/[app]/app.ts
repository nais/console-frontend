import { graphql as gql } from '$lib/urql/gql';

/**
 * Typed `App` query for the application detail page.
 *
 * Mirrors the previous Houdini-based query in `query.gql`. Loaded by
 * `+page.ts` to power `/team/[team]/[env]/app/[app]`.
 *
 * The `@with(limit: 20) @mask_disable` modifiers on the
 * `SidebarActivityLogFragment` spread are dropped — `SidebarActivity`
 * now reads its data through the fragment ref (codegen
 * `FragmentType<...>`) directly.
 */
export const AppQuery = gql(/* GraphQL */ `
	query App($app: String!, $team: Slug!, $env: String!) {
		team(slug: $team) {
			environment(name: $env) {
				application(name: $app) {
					__typename
					id
					name
					team {
						slug
					}
					issues {
						edges {
							node {
								id
								__typename
								message
								...IssueFragment
							}
						}
					}
					teamEnvironment {
						environment {
							name
						}
					}

					deletionStartedAt
					deployments(first: 1) {
						nodes {
							triggerUrl
							statuses {
								nodes {
									state
									message
									createdAt
								}
							}
						}
					}

					ingresses {
						type
						url
						metrics {
							errorsPerSecond
							requestsPerSecond
						}
					}

					instanceGroups {
						id
						name
						image {
							name
							tag
						}
						created
						readyInstances
						desiredInstances
						instances {
							id
							name
							status {
								state
							}
							restarts
						}
					}

					...SidebarActivityLogFragment
					...PersistenceFragment
					...WorkloadDeployFragment
					...NetworkPolicyFragment
					...ManifestFragment
				}
			}
		}
	}
`);

/**
 * `RestartApp` mutation, invoked when a team member confirms restarting
 * the application from the instances panel.
 */
export const RestartAppMutation = gql(/* GraphQL */ `
	mutation RestartApp($team: Slug!, $environment: String!, $application: String!) {
		restartApplication(
			input: { teamSlug: $team, environmentName: $environment, name: $application }
		) {
			application {
				name
			}
		}
	}
`);
