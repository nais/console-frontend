<script lang="ts">
	import { graphql } from '$houdini';
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

	$: console.log($teamInfo);
</script>

<h4>Team summary</h4>
{#if $teamInfo.data}
	<p>{$teamInfo.data.team.purpose}</p>

	{#if $teamInfo.data.team.gitHubTeamSlug}
		<strong>GitHub team:</strong>
		<!-- TODO: Denne må inn i chartet via gitHub.organization tilsvarende reconciler feature-->
		<a href="https://github.com/orgs/navikt/teams/{$teamInfo.data.team.gitHubTeamSlug}"
			>{$teamInfo.data.team.gitHubTeamSlug}</a
		>
		<br />
	{/if}

	{#if $teamInfo.data.team.slackChannel}
		<strong>Slack channel:</strong>
		{$teamInfo.data.team.slackChannel}
		<br />
	{/if}
	{#if $teamInfo.data.team.lastSuccessfulSync}
		<strong>Last successful sync:</strong>
		{$teamInfo.data.team.lastSuccessfulSync}
		<br />
	{/if}
	{#if $teamInfo.data.team.members}
		<strong>Members:</strong>
		<a href="/team/{teamName}/members">{$teamInfo.data.team.members.pageInfo.totalCount}</a>
		<br />
	{/if}
	{#if $teamInfo.data.team.repositories}
		<strong>Repositories:</strong>
		<a href="/team/{teamName}/repositories"
			>{$teamInfo.data.team.repositories.pageInfo.totalCount}</a
		>
		<br />
	{/if}
{/if}

<style>
</style>
