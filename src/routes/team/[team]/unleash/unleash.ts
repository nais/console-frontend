import { graphql as gql } from '$lib/urql/gql';

export const UnleashQuery = gql(/* GraphQL */ `
	query Unleash($team: Slug!) {
		team(slug: $team) {
			unleash {
				__typename
				name
				version
				releaseChannelName
				releaseChannel {
					name
					currentVersion
					type
					lastUpdated
				}
				allowedTeams(first: 20) {
					nodes {
						slug
					}
				}
				webIngress
				apiIngress
				metrics {
					apiTokens
					cpuUtilization
					cpuRequests
					memoryUtilization
					memoryRequests
					toggles
				}
				ready
			}
		}
	}
`);

export const UnleashReleaseChannelsQuery = gql(/* GraphQL */ `
	query UnleashReleaseChannels {
		unleashReleaseChannels {
			name
			currentVersion
			type
			lastUpdated
		}
	}
`);

export const CreateUnleashForTeamMutation = gql(/* GraphQL */ `
	mutation createUnleashForTeam($team: Slug!) {
		createUnleashForTeam(input: { teamSlug: $team }) {
			unleash {
				name
				version
				releaseChannelName
				allowedTeams {
					nodes {
						slug
					}
				}
				webIngress
				apiIngress
				metrics {
					apiTokens
					cpuUtilization
					cpuRequests
					memoryUtilization
					memoryRequests
					toggles
				}
				ready
			}
		}
	}
`);

export const UpdateUnleashInstanceMutation = gql(/* GraphQL */ `
	mutation UpdateUnleashInstance($team: Slug!, $releaseChannel: String!) {
		updateUnleashInstance(input: { teamSlug: $team, releaseChannel: $releaseChannel }) {
			unleash {
				name
				releaseChannelName
				releaseChannel {
					name
					currentVersion
					type
					lastUpdated
				}
			}
		}
	}
`);

export const AllowTeamAccessMutation = gql(/* GraphQL */ `
	mutation AllowTeamAccess($team: Slug!, $allowedTeamSlug: Slug!) {
		allowTeamAccessToUnleash(input: { teamSlug: $team, allowedTeamSlug: $allowedTeamSlug }) {
			unleash {
				name
			}
		}
	}
`);

export const RevokeTeamAccessMutation = gql(/* GraphQL */ `
	mutation RevokeTeamAccess($team: Slug!, $revokedTeamSlug: Slug!) {
		revokeTeamAccessToUnleash(input: { teamSlug: $team, revokedTeamSlug: $revokedTeamSlug }) {
			unleash {
				name
			}
		}
	}
`);

export const TeamSearchQuery = gql(/* GraphQL */ `
	query TeamSearch($query: String!) {
		search(first: 25, filter: { query: $query, type: TEAM }) {
			edges {
				node {
					__typename
					... on Team {
						slug
						purpose
					}
				}
			}
		}
	}
`);

export const AllTeamsQuery = gql(/* GraphQL */ `
	query AllTeams {
		teams(first: 25) {
			nodes {
				slug
				purpose
			}
		}
	}
`);
