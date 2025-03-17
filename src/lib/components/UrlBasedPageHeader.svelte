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
	}

	const { purpose, gitHubOrganization, slackChannel, gitHubTeam }: Props = $props();

	const dumbPageHeaderProps = $derived(urlToPageHeader(page.url));
</script>

<DumbPageHeader {...dumbPageHeaderProps} />

<div class="team-info">
	{#if dumbPageHeaderProps.heading === gitHubTeam}
		<div>
			<BodyShort>{purpose}</BodyShort>
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
