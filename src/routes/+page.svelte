<script lang="ts">
	import { Alert, Badge, Heading, ShButton, ShInput, Tag } from '#lib/shadcn/ui/index.js';
	import { MagnifyingGlassIcon, PlusIcon } from '#lib/icons/index.js';
	import { envTagVariant } from '#lib/envTagVariant.js';
	import Collection from '#lib/ui/Collection.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import ListItem from '#lib/ui/ListItem.svelte';
	import PageModal, { pageModalClick } from '#lib/ui/PageModal.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import SectionBoundary from '#lib/ui/SectionBoundary.svelte';
	import { exhaustive } from '#lib/utils/houdini.js';
	import type { PageProps } from './$types';
	import FavoritesList from './FavoritesList.svelte';
	import HomeActivitySection from './HomeActivitySection.svelte';
	import HomeTeamCard from './HomeTeamCard.svelte';
	import Onboarding from './Onboarding.svelte';
	import CreatePage from './team/create/+page.svelte';
	import { filterHomeTeams, homeIssueResource } from './homeOverview.js';

	let { data }: PageProps = $props();
	let { UserTeams, HomeAttention, HomeActivity, HomeTeamSummaries } = $derived(data);
	const uid = $props.id();
	let teamFilter = $state('');
	let paginationError = $state<string | null>(null);
	let summariesError = $state<string | null>(null);
	let changingPage = $state(false);

	const membership = $derived(
		$UserTeams?.data?.me.__typename === 'User' ? $UserTeams.data.me.teams : null
	);
	const noMemberships = $derived(
		!data.homeLoadErrors.teams &&
			!$UserTeams?.errors?.length &&
			membership?.pageInfo.totalCount === 0
	);
	const teams = $derived(membership?.edges.map(({ node }) => node.team) ?? []);
	const showTeamFilter = $derived((membership?.pageInfo.totalCount ?? 0) > 3);
	const filteredTeams = $derived(filterHomeTeams(teams, showTeamFilter ? teamFilter : ''));
	const attention = $derived($HomeAttention?.data?.issues);
	const quietAttention = $derived(
		attention?.pageInfo.totalCount === 0 &&
			!$HomeAttention?.errors?.length &&
			!data.homeLoadErrors.attention
	);
	const issues = $derived(exhaustive(attention?.nodes ?? []));
	const summaries = $derived(
		new Map(($HomeTeamSummaries?.data?.teams.nodes ?? []).map((team) => [team.slug, team]))
	);
	const summariesUnavailable = $derived(
		changingPage ||
			summariesError ||
			data.homeLoadErrors.summaries ||
			$HomeTeamSummaries?.errors?.length
	);

	async function changeTeamPage(direction: 'next' | 'previous') {
		if (!UserTeams || changingPage) return;
		changingPage = true;
		paginationError = null;
		summariesError = null;
		try {
			if (direction === 'next') await UserTeams.loadNextPage();
			else await UserTeams.loadPreviousPage();
			if (HomeTeamSummaries) {
				await HomeTeamSummaries.fetch({ variables: { teamSlugs: teams.map((team) => team.slug) } });
			}
		} catch (error) {
			console.error('Unable to update home team page:', error);
			paginationError = 'Unable to update the team page. Try again.';
			summariesError = 'Team summaries are unavailable.';
		} finally {
			changingPage = false;
		}
	}
</script>

<svelte:head><title>Nais Console</title></svelte:head>

{#snippet pinnedResources()}
	<div id="{uid}-pinned">
		<SectionBoundary message="Pinned favorites could not be displayed.">
			<FavoritesList />
		</SectionBoundary>
	</div>
{/snippet}

<div class="home">
	{#if noMemberships}
		<div class="layout-two-column overview-grid">
			<SectionBoundary message="Onboarding is unavailable. You can still create a team.">
				<Onboarding tenantName={data.tenantName} />
			</SectionBoundary>
			<aside aria-label="Your workspace">
				{@render pinnedResources()}
			</aside>
		</div>
	{:else}
		<header class="home-header">
			<Heading as="h1" size="xlarge">Your overview</Heading>
			<p>
				{quietAttention
					? 'No critical issues across your teams.'
					: 'Across your teams. A place to check in and get back to work.'}
			</p>
		</header>

		{#if !quietAttention}
			<section aria-labelledby="{uid}-attention" class="home-section attention-section">
				<div class="heading-title">
					<Heading as="h2" size="small" id="{uid}-attention">Needs attention</Heading>
					{#if attention && attention.pageInfo.totalCount > 0 && !$HomeAttention?.errors?.length}
						<Badge variant="destructive">{attention.pageInfo.totalCount} critical</Badge>
					{/if}
				</div>
				<SectionBoundary message="Attention items could not be displayed.">
					<GraphErrors errors={$HomeAttention?.errors} />
					{#if data.homeLoadErrors.attention}
						<Alert variant="warning" size="small">{data.homeLoadErrors.attention}</Alert>
					{:else if $HomeAttention?.errors?.length}
						<p>Attention items are unavailable. Check your teams’ issue pages.</p>
					{:else if attention}
						<p>Critical issues across all your teams. Open a resource to investigate.</p>
						<Collection headerless>
							{#each issues as issue (issue.id)}
								{const resource = $derived(homeIssueResource(issue))}
								<ListItem href={resource.href ?? `/team/${issue.teamEnvironment.team.slug}/issues`}>
									<div class="entry">
										<div class="entry-context">
											<Badge variant="destructive">Critical</Badge>
											<span>{issue.teamEnvironment.team.slug}</span>
											<Tag
												size="xsmall"
												variant={envTagVariant(issue.teamEnvironment.environment.name)}
											>
												{issue.teamEnvironment.environment.name}
											</Tag>
											<strong>{resource.name}</strong>
										</div>
										<p>{issue.message}</p>
									</div>
								</ListItem>
							{/each}
						</Collection>
						{#if issues.length < attention.nodes.length}
							<Alert variant="warning" size="small">
								Some critical issue types cannot be displayed yet. Check your teams’ issue pages.
							</Alert>
						{/if}
						{#if attention.pageInfo.hasNextPage}
							<p>
								Showing {issues.length} of {attention.pageInfo.totalCount} critical issues. Open your
								teams’ issue pages for the rest.
							</p>
						{/if}
					{:else}
						<p role="status">
							{$HomeAttention?.fetching
								? 'Loading attention items…'
								: 'Attention items are unavailable.'}
						</p>
					{/if}
				</SectionBoundary>
			</section>
		{/if}

		<div class="layout-two-column overview-grid">
			<section aria-labelledby="{uid}-teams" class="home-section">
				<div class="section-heading">
					<div class="heading-title">
						<Heading as="h2" size="medium" id="{uid}-teams">Your teams</Heading>
						{#if membership && !$UserTeams?.errors?.length}
							<Badge variant="secondary">{membership.pageInfo.totalCount}</Badge>
						{/if}
					</div>
					<ShButton
						variant="outline"
						size="sm"
						href="/team/create"
						icon={PlusIcon}
						onclick={pageModalClick}
					>
						Create team
					</ShButton>
				</div>
				<SectionBoundary message="Your teams could not be displayed.">
					<GraphErrors errors={$UserTeams?.errors} />
					{#if data.homeLoadErrors.teams || paginationError}
						<Alert variant="warning" size="small"
							>{paginationError ?? data.homeLoadErrors.teams}</Alert
						>
					{/if}
					{#if membership}
						{#if showTeamFilter}
							<ShInput
								type="search"
								size="sm"
								placeholder="Find a team on this page…"
								ariaLabel="Filter teams on this page"
								icon={MagnifyingGlassIcon}
								bind:value={teamFilter}
							/>
							{#if membership.pageInfo.hasNextPage || membership.pageInfo.hasPreviousPage}
								<p>The filter searches this page of teams. Use pagination to reach more teams.</p>
							{/if}
						{/if}
						{#if data.homeLoadErrors.summaries || summariesError || $HomeTeamSummaries?.errors?.length}
							<Alert variant="warning" size="small"
								>Team issue and workload counts are unavailable.</Alert
							>
						{/if}
						<div aria-busy={changingPage} class="teams-container">
							{#if filteredTeams.length}
								<div class="teams-grid">
									{#each filteredTeams as team (team.id)}
										{const summary = $derived(
											summariesUnavailable ? undefined : summaries.get(team.slug)
										)}
										<HomeTeamCard {team} {summary} />
									{/each}
								</div>
							{:else}
								<Collection headerless>
									<ListItem><p>No teams on this page match "{teamFilter.trim()}".</p></ListItem>
								</Collection>
							{/if}
						</div>
						<Pagination
							page={membership.pageInfo}
							fetching={changingPage || $UserTeams?.fetching}
							loaders={{
								loadPreviousPage: () => changeTeamPage('previous'),
								loadNextPage: () => changeTeamPage('next')
							}}
						/>
					{:else if !$UserTeams?.errors?.length && !data.homeLoadErrors.teams}
						<p role="status">
							{$UserTeams?.fetching ? 'Loading your teams…' : 'Your teams are unavailable.'}
						</p>
					{/if}
				</SectionBoundary>
			</section>

			<aside class="workspace" aria-label="Pinned Favorites">
				{@render pinnedResources()}
			</aside>
		</div>

		<HomeActivitySection store={HomeActivity} loadError={data.homeLoadErrors.activity} />
	{/if}
	<PageModal content={CreatePage} header="Create a New Team" />
</div>

<style>
	.home,
	.home-section,
	.workspace,
	.entry {
		display: flex;
		flex-direction: column;
	}
	.home,
	.workspace {
		gap: var(--nais-space-24);
	}
	.home-section {
		gap: var(--nais-space-12);
		min-width: 0;
	}
	.section-heading,
	.heading-title,
	.entry-context {
		display: flex;
		align-items: center;
		gap: var(--nais-space-12);
		flex-wrap: wrap;
	}
	.section-heading {
		justify-content: space-between;
	}
	.home-header p {
		margin-top: var(--nais-space-6);
	}
	.heading-title,
	.entry-context {
		gap: var(--nais-space-8);
	}
	.overview-grid {
		grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
	}
	p {
		margin: 0;
		font-size: var(--sh-font-size-sm);
		color: var(--foreground);
	}
	.entry {
		gap: var(--nais-space-6);
		min-width: 0;
		overflow-wrap: anywhere;
	}
	.entry-context {
		font-size: var(--sh-font-size-sm);
	}
	.teams-container {
		container-type: inline-size;
	}
	.teams-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--nais-space-12);
	}
	.workspace {
		min-width: 0;
	}
	@container (max-width: 500px) {
		.teams-grid {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 1024px) {
		.overview-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
