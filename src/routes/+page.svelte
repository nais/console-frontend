<script lang="ts">
	import { Badge, ShButton, ShInput } from '#lib/shadcn/ui/index.js';

	import PageModal, { pageModalClick } from '#lib/ui/PageModal.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import {
		ArrowRightIcon,
		MagnifyingGlassIcon,
		PersonGroupIcon,
		PlusIcon
	} from '#lib/icons/index.js';
	import type { PageProps } from './$types';
	import FavoritesList from './FavoritesList.svelte';
	import Onboarding from './Onboarding.svelte';
	import CreatePage from './team/create/+page.svelte';

	let { data }: PageProps = $props();

	let { UserTeams } = $derived(data);

	let tenantName = $derived(data.tenantName);

	let userTeams = $derived(
		$UserTeams.data?.me.__typename == 'User' && $UserTeams.data.me.teams?.edges.length
	);

	let teamFilter = $state('');

	let allTeams = $derived(
		$UserTeams.data?.me.__typename === 'User'
			? $UserTeams.data.me.teams.edges.map((e) => e.node.team)
			: []
	);

	let filteredTeams = $derived(
		teamFilter.trim()
			? allTeams.filter(
					(t) =>
						t.slug.toLowerCase().includes(teamFilter.toLowerCase()) ||
						t.purpose?.toLowerCase().includes(teamFilter.toLowerCase())
				)
			: allTeams
	);

	let totalTeamsCount = $derived(
		$UserTeams.data?.me.__typename === 'User' ? $UserTeams.data.me.teams.pageInfo.totalCount : 0
	);
</script>

<svelte:head><title>Nais Console</title></svelte:head>

{#if userTeams === 0}
	<div class="onboarding-container">
		<Onboarding {tenantName} />
	</div>
{:else}
	<div class="home-dashboard">
		<header class="home-header">
			<div class="home-header-left">
				<div class="home-title-row">
					<h1 class="home-title">Teams</h1>
					<Badge variant="secondary" mono>{totalTeamsCount}</Badge>
				</div>
				<p class="home-subtitle">
					Select a team workspace to manage workloads, databases, and security issues.
				</p>
			</div>

			<div class="home-header-actions">
				<div class="team-filter-wrap">
					<ShInput
						type="search"
						size="sm"
						placeholder="Filter teams…"
						ariaLabel="Filter teams"
						icon={MagnifyingGlassIcon}
						bind:value={teamFilter}
					/>
				</div>
				<ShButton variant="default" size="sm" href="/team/create" onclick={pageModalClick}>
					<PlusIcon aria-hidden="true" />
					Create team
				</ShButton>
			</div>
		</header>

		<div class="home-grid">
			<section class="teams-section" aria-label="My teams">
				{#if $UserTeams.data && $UserTeams.data.me.__typename === 'User'}
					{#if filteredTeams.length > 0}
						<div class="teams-bento">
							{#each filteredTeams as team (team.id)}
								<div class="team-card">
									<a href="/team/{team.slug}" class="team-card-main">
										<div class="team-card-header">
											<div class="team-avatar">
												<PersonGroupIcon aria-hidden="true" />
											</div>
											<div class="team-title-wrap">
												<h2 class="team-slug">{team.slug}</h2>
											</div>
											<ArrowRightIcon class="team-go-icon" aria-hidden="true" />
										</div>
										<p class="team-purpose">
											{team.purpose || 'No team description provided.'}
										</p>
									</a>
									<div class="team-card-footer">
										<a href="/team/{team.slug}/applications" class="team-quick-link">Apps</a>
										<span class="dot-sep" aria-hidden="true">·</span>
										<a href="/team/{team.slug}/jobs" class="team-quick-link">Jobs</a>
										<span class="dot-sep" aria-hidden="true">·</span>
										<a href="/team/{team.slug}/issues" class="team-quick-link">Issues</a>
										<span class="dot-sep" aria-hidden="true">·</span>
										<a href="/team/{team.slug}/vulnerabilities" class="team-quick-link">Security</a>
										<span class="dot-sep" aria-hidden="true">·</span>
										<a href="/team/{team.slug}/postgres" class="team-quick-link">Postgres</a>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="empty-card">
							<p>No teams match "{teamFilter}".</p>
						</div>
					{/if}

					<div class="pagination-wrap">
						<Pagination
							page={$UserTeams.data.me.teams.pageInfo}
							loaders={{
								loadPreviousPage: () => UserTeams.loadPreviousPage(),
								loadNextPage: () => UserTeams.loadNextPage()
							}}
						/>
					</div>
				{/if}
			</section>

			<aside class="favorites-aside" aria-label="Pinned favorites">
				<FavoritesList />
			</aside>
		</div>
	</div>

	<PageModal content={CreatePage} header="Create a New Team" />
{/if}

<style>
	.onboarding-container {
		padding-top: 1.5rem;
	}

	.home-dashboard {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.home-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border);
	}

	.home-header-left {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.home-title-row {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.home-title {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
		letter-spacing: -0.025em;
		line-height: 1.25;
		color: var(--foreground);
	}

	.home-subtitle {
		margin: 0;
		font-size: 0.875rem;
		color: var(--muted-foreground);
	}

	.home-header-actions {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		flex-wrap: wrap;
	}

	.team-filter-wrap {
		width: 220px;
	}

	.home-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 340px;
		gap: 1.5rem;
		align-items: start;
	}

	.teams-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}

	.teams-bento {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 0.875rem;
	}

	.team-card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		background-color: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		box-shadow: var(--sh-shadow-xs);
		overflow: hidden;
		transition:
			border-color 140ms ease,
			box-shadow 140ms ease;
	}

	.team-card:hover {
		border-color: var(--border-strong);
		box-shadow: var(--sh-shadow-sm);
	}

	.team-card-main {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.5rem;
		padding: 1rem 1.125rem 0.875rem;
		text-decoration: none;
		color: inherit;
		flex: 1;
	}

	.team-card-main:hover {
		text-decoration: none;
	}

	.team-card-header {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
	}

	.team-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.875rem;
		height: 1.875rem;
		border-radius: var(--radius-md);
		background-color: var(--secondary);
		border: 1px solid var(--border);
		color: var(--muted-foreground);
		font-size: 0.9375rem;
		flex-shrink: 0;
	}

	.team-title-wrap {
		flex: 1;
		min-width: 0;
	}

	.team-slug {
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.team-card :global(.team-go-icon) {
		color: var(--muted-foreground);
		font-size: 0.875rem;
		flex-shrink: 0;
		transition:
			transform 140ms ease,
			color 140ms ease;
	}

	.team-card:hover :global(.team-go-icon) {
		color: var(--foreground);
		transform: translateX(2px);
	}

	.team-purpose {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--muted-foreground);
		line-height: 1.45;
		text-align: left;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.team-card-footer {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 1.125rem;
		background-color: var(--background-subtle);
		border-top: 1px solid var(--border);
		font-size: 0.75rem;
	}

	.team-quick-link {
		color: var(--muted-foreground);
		text-decoration: none;
		font-weight: 500;
		transition: color 120ms ease;
	}

	.team-quick-link:hover {
		color: var(--foreground);
		text-decoration: underline;
	}

	.dot-sep {
		color: var(--border-strong);
	}

	.empty-card {
		padding: 2rem;
		text-align: center;
		background-color: var(--card);
		border: 1px dashed var(--border);
		border-radius: var(--radius);
		color: var(--muted-foreground);
		font-size: 0.875rem;
	}

	.pagination-wrap {
		margin-top: 0.25rem;
	}

	.favorites-aside {
		min-width: 0;
	}

	@media (max-width: 1100px) {
		.home-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
