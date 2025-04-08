<script lang="ts">
	import { page } from '$app/stores';
	import { graphql, PendingValue } from '$houdini';
	import { BodyShort, Heading, Skeleton } from '@nais/ds-svelte-community';
	import { get } from 'svelte/store';
	import type { TeamInfoVariables } from './$houdini';

	interface Props {
		teamSlug: string;
		viewerIsMember: boolean;
	}

	let { teamSlug, viewerIsMember }: Props = $props();

	export const _TeamInfoVariables: TeamInfoVariables = () => {
		return { team: teamSlug };
	};

	const teamInfo = graphql(`
		query TeamInfo($team: Slug!) @load {
			team(slug: $team) @loading {
				externalResources @loading {
					gitHubTeam @loading {
						slug @loading
					}
				}
				purpose @loading
				slackChannel @loading
			}
		}
	`);
	const githubOrganization = get(page).data.githubOrganization;
</script>

<div class="wrapper">
	<Heading level="4" size="small">Team Summary</Heading>

	{#if $teamInfo.data}
		{@const t = $teamInfo.data.team}
		{#if t.purpose !== PendingValue}
			<BodyShort>{t.purpose}</BodyShort>
		{:else}
			<Skeleton variant="text" />
		{/if}

		{#if t.externalResources.gitHubTeam}
			<BodyShort
				><strong>GitHub team:</strong>
				{#if t.externalResources.gitHubTeam?.slug !== PendingValue}
					<a
						href="https://github.com/orgs/{githubOrganization}/teams/{t.externalResources.gitHubTeam
							.slug}"
					>
						{t.externalResources.gitHubTeam?.slug}
					</a>
				{:else}
					<Skeleton variant="text" />
				{/if}
			</BodyShort>
		{/if}
		<BodyShort>
			{#if t.slackChannel}
				<strong>Slack channel:</strong>
				{#if t.slackChannel !== PendingValue}
					{t.slackChannel}
				{:else}
					<Skeleton variant="text" />
				{/if}
				<br />
			{/if}
			{#if viewerIsMember}
				<a href="/team/{teamSlug}/settings">View team settings</a>
			{/if}
		</BodyShort>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4, --a-spacing-1);
		align-items: start;
	}
</style>
