<script lang="ts">
	import { page } from '$app/stores';
	import { graphql } from '$houdini';
	import { get } from 'svelte/store';
	import type { TeamInfoVariables } from './$houdini';

	export let teamName: string;

	export const _TeamInfoVariables: TeamInfoVariables = () => {
		return { team: teamName };
	};

	const teamInfo = graphql(`
		query TeamInfo($team: Slug!) @load {
			team(slug: $team) {
				slug
				gitHubTeamSlug
				googleArtifactRegistry
				googleGroupEmail
				lastSuccessfulSync
				members {
					pageInfo {
						totalCount
					}
				}
				purpose
				repositories {
					pageInfo {
						totalCount
					}
				}
				slackChannel
			}
		}
	`);
	const githubOrganization = get(page).data.githubOrganization;
</script>

<h4>Team summary</h4>
{#if $teamInfo.data}
	<p>{$teamInfo.data.team.purpose}</p>

	{#if $teamInfo.data.team.gitHubTeamSlug}
		<strong>GitHub team:</strong>
		<a
			href="https://github.com/orgs/{githubOrganization}/teams/{$teamInfo.data.team.gitHubTeamSlug}"
			>{$teamInfo.data.team.gitHubTeamSlug}</a
		>
		<br />
	{/if}

	{#if $teamInfo.data.team.slackChannel}
		<strong>Slack channel:</strong>
		{$teamInfo.data.team.slackChannel}
		<br />
	{/if}
{/if}

<style>
</style>
