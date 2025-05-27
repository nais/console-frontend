<script lang="ts">
	import { page } from '$app/state';
	import GitHubIcon from '$lib/icons/GitHubIcon.svelte';
	import { urlToPageHeader } from '$lib/urlToPageHeader';
	import { BodyShort } from '@nais/ds-svelte-community';
	import IconLabel from './IconLabel.svelte';
	import PageHeader from './PageHeader.svelte';

	interface Props {
		purpose?: string;
		gitHubOrganization?: string;
		gitHubTeam?: string;
		memberCount: number;
		viewerIsMember: boolean;
	}

	const { purpose, gitHubOrganization, gitHubTeam, memberCount, viewerIsMember }: Props = $props();

	const pageHeaderProps = $derived(urlToPageHeader(page.url));
</script>

<svelte:head
	><title
		>{[
			pageHeaderProps.heading,
			...pageHeaderProps.breadcrumbs.toReversed().map((b) => b.label)
		].join(' - ')} - Nais Console</title
	></svelte:head
>

<PageHeader {...pageHeaderProps} />

<div class="team-info">
	{#if pageHeaderProps.breadcrumbs.length === 0}
		<!-- no breadcrumbs == on team page -->
		<div>
			<BodyShort spacing>{purpose}</BodyShort>
			<BodyShort>
				{memberCount} team member{memberCount === 1 ? '' : 's'}.
				<a href="/team/{pageHeaderProps.heading}/members">
					{viewerIsMember ? 'Manage members' : 'View all'}
				</a>
			</BodyShort>
		</div>
		<div>
			<IconLabel
				href="https://github.com/orgs/{gitHubOrganization}/teams/{gitHubTeam}"
				icon={GitHubIcon}
			>
				{#snippet label()}
					<span class="label">Visit {gitHubTeam} on GitHub</span>
				{/snippet}
			</IconLabel>
			<!-- <IconLabel icon={SlackIcon}>
				{#snippet label()}
					<span class="label">Reach out on Slack: {slackChannel}</span>
				{/snippet}
			</IconLabel> -->
		</div>
	{/if}
</div>

<style>
	.team-info {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: var(--spacing-layout);
		margin-top: calc(-1 * var(--spacing-layout));
	}
</style>
