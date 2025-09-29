<script lang="ts">
	import { page } from '$app/state';
	import { urlToPageHeader } from '$lib/urlToPageHeader';
	import { BodyShort } from '@nais/ds-svelte-community';
	import PageHeader from './PageHeader.svelte';

	interface Props {
		purpose?: string;
		gitHubOrganization?: string;
		gitHubTeam?: string;
		memberCount: number;
		viewerIsMember: boolean;
	}

	const { purpose }: Props = $props();

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
			<BodyShort>{purpose}</BodyShort>
			<!-- <BodyShort spacing>
				{memberCount} team member{memberCount === 1 ? '' : 's'}.
				<a href="/team/{pageHeaderProps.heading}/members">
					{viewerIsMember ? 'Manage members' : 'View all'}
				</a>
			</BodyShort>
			<IconLabel
				href="https://github.com/orgs/{gitHubOrganization}/teams/{gitHubTeam}"
				icon={GitHubIcon}
			>
				{#snippet label()}
					<span class="label">Visit {gitHubTeam} on GitHub</span>
				{/snippet}
			</IconLabel> -->
		</div>
	{/if}
</div>

<style>
	.team-info {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
		margin-top: calc(-1 * var(--spacing-layout));
	}
</style>
