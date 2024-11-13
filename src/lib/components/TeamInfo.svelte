<script lang="ts">
	import { page } from '$app/stores';
	import { graphql, PendingValue } from '$houdini';
	import { Skeleton } from '@nais/ds-svelte-community';
	import { get } from 'svelte/store';
	import type { TeamInfoVariables } from './$houdini';

	export let teamName: string;

	export const _TeamInfoVariables: TeamInfoVariables = () => {
		return { team: teamName };
	};

	const teamInfo = graphql(`
		query TeamInfo($team: Slug!) @load {
			team(slug: $team) @loading {
				gitHubTeamSlug @loading
				purpose @loading
				slackChannel @loading
			}
		}
	`);
	const githubOrganization = get(page).data.githubOrganization;
</script>

<h4>Team summary</h4>
{#if $teamInfo.data}
	{@const t = $teamInfo.data.team}
	{#if t.purpose !== PendingValue}
		<p>{t.purpose}</p>
	{:else}
		<Skeleton variant="text" />
	{/if}

	{#if t.gitHubTeamSlug}
		<strong>GitHub team:</strong>
		{#if t.gitHubTeamSlug !== PendingValue}
			<a href="https://github.com/orgs/{githubOrganization}/teams/{t.gitHubTeamSlug}"
				>{t.gitHubTeamSlug}</a
			>
		{:else}
			<Skeleton variant="text" />
		{/if}
		<br />
	{/if}

	{#if t.slackChannel}
		<strong>Slack channel:</strong>
		{#if t.slackChannel !== PendingValue}
			{t.slackChannel}
		{:else}
			<Skeleton variant="text" />
		{/if}
		<br />
	{/if}
{/if}

<style>
</style>
