import { graphql as gql } from '$lib/urql/gql';

/**
 * `TeamSettings` query for the team settings page.
 *
 * Migrated from the previous Houdini `query.gql`. The
 * `@with(...) @mask_disable` modifiers on the
 * `...SidebarActivityLogFragment` spread have been dropped — urql has no
 * fragment-arguments equivalent, and the unfiltered selection is what
 * the consumer reads off `team.activityLog` anyway.
 */
export const TeamSettingsQuery = gql(/* GraphQL */ `
	query TeamSettings($team: Slug!, $viewerIsMember: Boolean!) {
		team(slug: $team) {
			slug
			lastSuccessfulSync
			purpose
			slackChannel
			deploymentKey @include(if: $viewerIsMember) {
				created
				expires
				key
			}
			environments {
				id
				environment {
					name
				}
				gcpProjectID
				slackAlertsChannel
			}
			externalResources {
				entraIDGroup {
					groupID
				}
				googleGroup {
					email
				}
				googleArtifactRegistry {
					repository
				}
				cdn {
					bucket
				}
				gitHubTeam {
					slug
				}
			}
			...SidebarActivityLogFragment
		}
	}
`);

/**
 * `RotateDeployKey` mutation — also used to create the initial deploy
 * key when none exists.
 */
export const RotateDeployKeyMutation = gql(/* GraphQL */ `
	mutation RotateDeployKey($team: Slug!) {
		changeDeploymentKey(input: { teamSlug: $team }) {
			deploymentKey {
				created
				expires
				key
			}
		}
	}
`);

/**
 * `UpdateTeam` mutation — used by the inline `EditText` editors for
 * `purpose` and `slackChannel`.
 */
export const UpdateTeamMutation = gql(/* GraphQL */ `
	mutation UpdateTeam($input: UpdateTeamInput!) {
		updateTeam(input: $input) {
			team {
				purpose
				slackChannel
			}
		}
	}
`);

/**
 * `UpdateTeamSlackAlertsChannel` mutation — sets the per-environment
 * Slack alerts channel.
 */
export const UpdateTeamSlackAlertsChannelMutation = gql(/* GraphQL */ `
	mutation UpdateTeamSlackAlertsChannel($input: UpdateTeamEnvironmentInput!) {
		updateTeamEnvironment(input: $input) {
			environment {
				slackAlertsChannel
			}
		}
	}
`);

/**
 * `GetTeamDeleteKey` mutation — initiates a team deletion request and
 * returns a sharable confirmation key/URL.
 */
export const GetTeamDeleteKeyMutation = gql(/* GraphQL */ `
	mutation GetTeamDeleteKey($input: RequestTeamDeletionInput!) {
		requestTeamDeletion(input: $input) {
			key {
				createdAt
				createdBy {
					email
				}
				expires
				key
				team {
					slug
				}
			}
		}
	}
`);

/**
 * `TeamDeleteKey` query for the `confirm_delete` page — looks up the
 * pending delete-key for a team so a second owner can confirm the
 * deletion request.
 */
export const TeamDeleteKeyQuery = gql(/* GraphQL */ `
	query TeamDeleteKey($team: Slug!, $key: String!) {
		team(slug: $team) {
			deleteKey(key: $key) {
				team {
					slug
				}
				createdAt
				createdBy {
					id
					name
					email
				}
				expires
				key
			}
		}
	}
`);

/**
 * `ConfirmTeamDeletion` mutation — triggered from `confirm_delete` to
 * actually start the team deletion using a previously generated key.
 */
export const ConfirmTeamDeletionMutation = gql(/* GraphQL */ `
	mutation ConfirmTeamDeletion($key: String!, $team: Slug!) {
		confirmTeamDeletion(input: { key: $key, slug: $team }) {
			deletionStarted
		}
	}
`);
