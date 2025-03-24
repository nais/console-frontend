<script lang="ts">
	import { page } from '$app/state';
	import GitHubIcon from '$lib/icons/GitHubIcon.svelte';
	import SlackIcon from '$lib/icons/SlackIcon.svelte';
	import { urlToPageHeader } from '$lib/urlToPageHeader';
	import { BodyShort } from '@nais/ds-svelte-community';
	import IconLabel from './IconLabel.svelte';
	import DumbPageHeader from './PageHeader.svelte';

	interface Props {
		purpose?: string;
		gitHubOrganization?: string;
		gitHubTeam?: string;
		slackChannel?: string;
		memberCount: number;
		viewerIsMember: boolean;
	}

	const {
		purpose,
		gitHubOrganization,
		slackChannel,
		gitHubTeam,
		memberCount,
		viewerIsMember
	}: Props = $props();

	const dumbPageHeaderProps = $derived(urlToPageHeader(page.url));
</script>

<DumbPageHeader {...dumbPageHeaderProps} />

<div class="team-info">
	{#if dumbPageHeaderProps.breadcrumbs.length === 0}
		<!-- no breadcrumbs == on team page -->
		<div>
			<BodyShort spacing>{purpose}</BodyShort>
			<BodyShort>
				{memberCount} team member{memberCount === 1 ? '' : 's'}.
				<a href="/team/{dumbPageHeaderProps.heading}/members">
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
			<IconLabel icon={SlackIcon}>
				{#snippet label()}
					<span class="label">Reach out on Slack: {slackChannel}</span>
				{/snippet}
			</IconLabel>
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
