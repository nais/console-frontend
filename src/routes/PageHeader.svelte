<script lang="ts">
	import { browser } from '$app/env';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { apmServicesURL, docURL, tenantURL } from '#lib/doc.js';
	import SearchModal from '#lib/domain/search/SearchModal.svelte';
	import Feedback from '#lib/feedback/Feedback.svelte';
	import GrafanaIcon from '#lib/icons/GrafanaIcon.svelte';
	import AppSidebar from '#lib/shadcn/ui/AppSidebar.svelte';
	import { tenantNavigation } from '#lib/tenantNavigation.js';
	import { Button, Theme } from '#lib/shadcn/ui/index.js';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { themeSwitch } from '#lib/stores/theme.svelte.js';

	import {
		BooksIcon,
		ChatElipsisIcon,
		ChevronDownIcon,
		LeaveIcon,
		LineGraphIcon,
		MagnifyingGlassIcon,
		MenuHamburgerIcon,
		MoonIcon,
		PersonGroupIcon,
		SunIcon
	} from '#lib/icons/index.js';
	import type { Snippet } from 'svelte';
	import Logo from '../Logo.svelte';

	interface Props {
		user:
			| {
					readonly name: string;
					readonly email?: string;
					readonly isAdmin: boolean;
					readonly teams?: {
						readonly pageInfo?: { readonly hasNextPage: boolean };
						readonly edges: readonly {
							readonly node: {
								readonly team: {
									readonly id: string;
									readonly slug: string;
									readonly purpose: string;
								};
							};
						}[];
					};
			  }
			| undefined;
		features?: {
			unleash: { enabled: boolean };
			valkey: { enabled: boolean };
			kafka: { enabled: boolean };
			openSearch: { enabled: boolean };
		};
		children?: Snippet;
		loadMoreTeams?: () => Promise<unknown>;
		teamsFetching?: boolean;
		teamErrors?: { message: string }[] | null;
	}

	const uid = $props.id();

	let {
		user,
		features,
		children,
		loadMoreTeams,
		teamsFetching = false,
		teamErrors
	}: Props = $props();

	let sidebarCollapsed = $state(false);
	let mobileSidebarOpen = $state(false);
	let searchOpen = $state(false);
	let feedbackOpen = $state(false);
	let teamSwitcherOpen = $state(false);
	let teamQuery = $state('');

	const isMac = browser && navigator.platform === 'MacIntel';

	const currentTeamSlug = $derived(page.params.team);
	const userTeams = $derived((user?.teams?.edges ?? []).map((e) => e.node.team));
	const hasMoreTeams = $derived(user?.teams?.pageInfo?.hasNextPage ?? false);

	const filteredUserTeams = $derived(
		teamQuery.trim()
			? userTeams.filter((t) => t.slug.toLowerCase().includes(teamQuery.trim().toLowerCase()))
			: userTeams
	);

	const tenantItems = $derived(tenantNavigation(page.url.pathname, user?.isAdmin));

	function teamSwitchHref(targetSlug: string) {
		const path = page.url.pathname;
		if (!path.startsWith('/team/')) {
			return `/team/${targetSlug}`;
		}
		const parts = path.split('/').filter(Boolean);
		if (parts.length === 3) {
			return `/team/${targetSlug}/${parts[2]}`;
		}
		return `/team/${targetSlug}`;
	}

	function userInitials(name?: string) {
		if (!name) return 'U';
		const parts = name.trim().split(/\s+/);
		if (parts.length >= 2) {
			return (parts[0][0] + parts.at(-1)![0]).toUpperCase();
		}
		return name.slice(0, 2).toUpperCase();
	}

	function isTypingTarget(target: EventTarget | null) {
		if (!(target instanceof HTMLElement)) {
			return false;
		}
		return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
	}

	const onkeydown = (e: KeyboardEvent) => {
		if (e.key === 'k' && ((isMac && e.metaKey) || (!isMac && e.ctrlKey))) {
			e.preventDefault();
			searchOpen = true;
		} else if (
			!isTypingTarget(e.target) &&
			e.key === '/' &&
			!e.metaKey &&
			!e.ctrlKey &&
			!e.altKey
		) {
			e.preventDefault();
			searchOpen = true;
		} else if (e.key === 'Escape' && teamSwitcherOpen) {
			teamSwitcherOpen = false;
		}
	};

	afterNavigate(() => {
		teamSwitcherOpen = false;
		teamQuery = '';
		mobileSidebarOpen = false;
	});
</script>

<svelte:document {onkeydown} />

{#if teamSwitcherOpen}
	<button
		type="button"
		class="dropdown-backdrop"
		aria-label="Close team switcher"
		onclick={() => (teamSwitcherOpen = false)}
	></button>
{/if}

<div class="sh-shell">
	<a href={`#${uid}-main`} class="skip-link">Skip to content</a>
	<header class="sh-topnav">
		<div class="topnav-left">
			<button
				type="button"
				class="mobile-menu-btn"
				aria-label="Open navigation"
				aria-haspopup="dialog"
				aria-expanded={mobileSidebarOpen}
				onclick={() => (mobileSidebarOpen = !mobileSidebarOpen)}
			>
				<MenuHamburgerIcon aria-hidden="true" />
			</button>

			<a href="/" class="brand-link" title="Nais Console">
				<Logo height="22px" />
				<span class="brand-title">Nais Console</span>
			</a>

			<span class="topnav-slash" aria-hidden="true">/</span>

			<!-- Team Switcher -->
			<div class="team-switcher-container">
				<button
					type="button"
					class="team-switcher-trigger"
					class:active={!!currentTeamSlug}
					aria-expanded={teamSwitcherOpen}
					aria-haspopup="menu"
					onclick={() => (teamSwitcherOpen = !teamSwitcherOpen)}
				>
					<span class="switcher-avatar" class:active={!!currentTeamSlug}>
						{#if currentTeamSlug}
							{currentTeamSlug.slice(0, 2).toUpperCase()}
						{:else}
							<PersonGroupIcon aria-hidden="true" />
						{/if}
					</span>
					<span class="switcher-label">
						{currentTeamSlug ?? 'Select team'}
					</span>
					<ChevronDownIcon aria-hidden="true" class="switcher-chevron" />
				</button>

				{#if teamSwitcherOpen}
					<div class="team-popover" role="menu" aria-label="Switch team">
						<div class="popover-search-box">
							<MagnifyingGlassIcon aria-hidden="true" />
							<input
								type="search"
								placeholder="Find team…"
								aria-label="Find team"
								bind:value={teamQuery}
								class="popover-search-input"
							/>
						</div>
						<div class="popover-list">
							{#each filteredUserTeams as t (t.id)}
								{const isCurrent = $derived(t.slug === currentTeamSlug)}
								<a
									href={teamSwitchHref(t.slug)}
									class="popover-item"
									class:selected={isCurrent}
									role="menuitem"
								>
									<span class="popover-monogram">
										{t.slug.slice(0, 2).toUpperCase()}
									</span>
									<span class="popover-team-info">
										<span class="popover-team-name">{t.slug}</span>
										{#if t.purpose}
											<span class="popover-team-purpose">{t.purpose}</span>
										{/if}
									</span>
									{#if isCurrent}
										<span class="popover-active-dot" aria-label="Current team"></span>
									{/if}
								</a>
							{:else}
								<div class="popover-empty">
									{hasMoreTeams
										? 'No matches in loaded teams. Load more teams to continue searching.'
										: 'No teams found'}
								</div>
							{/each}
							{#if hasMoreTeams && loadMoreTeams}
								<Button
									variant="tertiary"
									size="small"
									loading={teamsFetching}
									disabled={teamsFetching}
									onclick={loadMoreTeams}>Load more teams</Button
								>
							{/if}
							<GraphErrors errors={teamErrors} size="small" />
						</div>
						<div class="popover-footer">
							<a href="/" class="popover-footer-link">All teams</a>
							<a href="/team/create" class="popover-footer-link">+ New team</a>
						</div>
					</div>
				{/if}
			</div>

			<nav class="tenant-nav" aria-label="Tenant">
				{#each tenantItems as item (item.href)}
					<a
						href={item.href}
						class={['tenant-nav-link', { active: item.active }]}
						aria-current={item.active ? 'page' : undefined}
					>
						{item.label}
					</a>
				{/each}
			</nav>
		</div>

		<div class="topnav-right">
			<div class="jump-to-control">
				<button
					type="button"
					class="jump-to-btn"
					onclick={() => (searchOpen = true)}
					aria-label="Jump to team or workload"
					aria-keyshortcuts={isMac ? 'Meta+K /' : 'Control+K /'}
					title={`Jump to team or workload (${isMac ? '⌘K' : 'Ctrl+K'} or /)`}
				>
					<MagnifyingGlassIcon aria-hidden="true" />
					<span class="jump-to-text">Jump to</span>
				</button>
				<kbd class="sh-kbd" aria-hidden="true">{isMac ? '⌘K' : 'Ctrl+K'}</kbd>
			</div>

			<div class="external-links-group">
				<a
					href={docURL()}
					target="_blank"
					rel="noopener noreferrer"
					class="topnav-tool-link"
					title="Nais Documentation"
				>
					<BooksIcon aria-hidden="true" />
					<span>Docs</span>
				</a>
				<a
					href={apmServicesURL()}
					target="_blank"
					rel="noopener noreferrer"
					class="topnav-tool-link"
					title="Application Performance Monitoring"
				>
					<LineGraphIcon aria-hidden="true" />
					<span>APM</span>
				</a>
				<a
					href={tenantURL('grafana')}
					target="_blank"
					rel="noopener noreferrer"
					class="topnav-tool-link"
					title="Grafana"
				>
					<GrafanaIcon />
					<span>Grafana</span>
				</a>
			</div>

			<button
				type="button"
				class="topnav-icon-btn"
				onclick={() => (feedbackOpen = true)}
				aria-label="Send feedback"
				title="Send feedback"
			>
				<ChatElipsisIcon aria-hidden="true" />
			</button>

			<button
				type="button"
				class="topnav-icon-btn"
				onclick={() => themeSwitch.setTheme(themeSwitch.theme === 'dark' ? 'light' : 'dark')}
				aria-label="Toggle color theme"
				title={themeSwitch.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
			>
				{#if themeSwitch.theme === 'dark'}
					<SunIcon aria-hidden="true" />
				{:else}
					<MoonIcon aria-hidden="true" />
				{/if}
			</button>

			{#if user}
				<div class="user-pill" title={user.name}>
					<span class="user-avatar">{userInitials(user.name)}</span>
					<span class="user-name">{user.name}</span>
					<a
						href="/oauth2/logout"
						class="logout-link"
						aria-label="Log out"
						title="Log out"
						data-sveltekit-reload
					>
						<LeaveIcon aria-hidden="true" />
					</a>
				</div>
			{/if}
		</div>
	</header>

	<div class="sh-body">
		<AppSidebar
			{features}
			{tenantItems}
			bind:collapsed={sidebarCollapsed}
			bind:mobileOpen={mobileSidebarOpen}
		/>

		<div class="sh-workspace">
			<main id={`${uid}-main`} class="sh-content-area" tabindex="-1">
				{@render children?.()}
			</main>
		</div>
	</div>
</div>

{#if searchOpen}
	<Theme theme={themeSwitch.theme}>
		<SearchModal bind:open={searchOpen} />
	</Theme>
{/if}

{#if feedbackOpen}
	<Feedback close={() => (feedbackOpen = false)} />
{/if}

<style>
	.skip-link {
		position: fixed;
		inset-block-start: var(--ax-space-8);
		inset-inline-start: var(--ax-space-8);
		z-index: 100;
		padding: var(--ax-space-8) var(--ax-space-16);
		border-radius: var(--radius-sm);
		background-color: var(--primary);
		color: var(--primary-foreground);
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-bold);
		transform: translateY(calc(-100% - var(--ax-space-16)));
	}

	.skip-link:focus {
		transform: translateY(0);
		outline: var(--ax-space-2) solid var(--ring);
		outline-offset: var(--ax-space-2);
	}

	.sh-shell {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		width: 100%;
		background-color: var(--background);
		color: var(--foreground);
	}

	.sh-topnav {
		position: sticky;
		top: 0;
		z-index: 50;
		height: var(--ax-space-56);
		padding: 0 var(--ax-space-20);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-16);
		background-color: var(--card);
		border-bottom: 1px solid var(--border);
	}

	.topnav-left {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		min-width: 0;
	}

	.brand-link {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-8);
		text-decoration: none;
		color: var(--foreground);
		flex-shrink: 0;
	}

	.brand-title {
		font-size: var(--sh-font-size-body);
		font-weight: 600;
		letter-spacing: -0.015em;
		white-space: nowrap;
	}

	.topnav-slash {
		color: var(--muted-foreground);
		font-size: var(--ax-font-size-medium);
		user-select: none;
		padding: 0 var(--ax-space-2);
	}

	/* Team Switcher */
	.team-switcher-container {
		position: relative;
		flex-shrink: 0;
	}

	.team-switcher-trigger {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-8);
		height: var(--ax-space-32);
		padding: 0 var(--ax-space-8) 0 var(--ax-space-6);
		border-radius: calc(var(--radius) - 2px);
		border: 1px solid var(--border);
		background-color: var(--background);
		color: var(--foreground);
		font-size: var(--ax-font-size-small);
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color 120ms ease,
			border-color 120ms ease;
	}

	.team-switcher-trigger:hover {
		background-color: var(--secondary);
		border-color: var(--border-strong);
	}

	.switcher-avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--sh-avatar-size-sm);
		height: var(--sh-avatar-size-sm);
		border-radius: var(--ax-radius-4);
		background: var(--secondary);
		color: var(--muted-foreground);
		font-size: var(--sh-font-size-micro);
		font-weight: 700;
		flex-shrink: 0;
	}

	.switcher-avatar.active {
		background: var(--primary);
		color: var(--primary-foreground);
	}

	.switcher-label {
		max-width: 10rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.team-switcher-trigger :global(.switcher-chevron) {
		color: var(--muted-foreground);
		font-size: var(--sh-font-size-caption);
	}

	.dropdown-backdrop {
		position: fixed;
		inset: 0;
		z-index: 48;
		background: transparent;
		border: none;
		padding: 0;
		cursor: default;
	}

	.team-popover {
		position: absolute;
		top: calc(100% + var(--ax-space-6));
		left: 0;
		width: 17.5rem;
		max-height: 22rem;
		display: flex;
		flex-direction: column;
		background-color: var(--popover);
		color: var(--popover-foreground);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius);
		box-shadow: var(--sh-shadow-lg);
		z-index: 60;
		overflow: hidden;
	}

	.popover-search-box {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		padding: var(--ax-space-8) var(--ax-space-10);
		border-bottom: 1px solid var(--border);
		color: var(--muted-foreground);
		font-size: var(--ax-font-size-small);
	}

	.popover-search-input {
		width: 100%;
		border: none;
		background: transparent;
		color: var(--foreground);
		font-family: inherit;
		font-size: var(--ax-font-size-small);
		outline: none;
	}

	.popover-search-input::placeholder {
		color: var(--muted-foreground);
	}

	.popover-list {
		overflow-y: auto;
		padding: var(--ax-space-4);
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-2);
	}

	.popover-item {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		padding: var(--ax-space-6) var(--ax-space-8);
		border-radius: calc(var(--radius) - 4px);
		text-decoration: none;
		color: var(--foreground);
		transition: background-color 100ms ease;
	}

	.popover-item:hover {
		background-color: var(--secondary);
		text-decoration: none;
	}

	.popover-item.selected {
		background-color: var(--primary-muted);
	}

	.popover-monogram {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--sh-avatar-size-md);
		height: var(--sh-avatar-size-md);
		border-radius: var(--radius-xs);
		background-color: var(--secondary);
		color: var(--foreground);
		font-size: var(--sh-font-size-micro);
		font-weight: 700;
		flex-shrink: 0;
	}

	.popover-team-info {
		display: flex;
		flex-direction: column;
		min-width: 0;
		flex: 1;
	}

	.popover-team-name {
		font-size: var(--ax-font-size-small);
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.popover-team-purpose {
		font-size: var(--sh-font-size-xs);
		color: var(--muted-foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.popover-active-dot {
		width: var(--sh-status-dot-size);
		height: var(--sh-status-dot-size);
		border-radius: 9999px;
		background-color: var(--primary);
		flex-shrink: 0;
	}

	.popover-empty {
		padding: var(--ax-space-14);
		text-align: center;
		font-size: var(--ax-font-size-small);
		color: var(--muted-foreground);
	}

	.popover-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--ax-space-8) var(--ax-space-10);
		border-top: 1px solid var(--border);
		background-color: var(--background-subtle);
	}

	.popover-footer-link {
		font-size: var(--ax-font-size-small);
		font-weight: 500;
		color: var(--primary);
		text-decoration: none;
	}

	.popover-footer-link:hover {
		text-decoration: underline;
	}

	/* Platform Nav Links */
	.tenant-nav {
		display: flex;
		align-items: center;
		gap: var(--ax-space-2);
		margin-left: var(--ax-space-8);
	}

	.tenant-nav-link {
		display: inline-flex;
		align-items: center;
		height: var(--ax-space-32);
		padding: 0 var(--ax-space-10);
		border-radius: calc(var(--radius) - 2px);
		font-size: var(--ax-font-size-small);
		font-weight: 500;
		color: var(--muted-foreground);
		text-decoration: none;
		white-space: nowrap;
		transition:
			color 120ms ease,
			background-color 120ms ease;
	}

	.tenant-nav-link:hover {
		color: var(--foreground);
		background-color: var(--secondary);
		text-decoration: none;
	}

	.tenant-nav-link.active {
		color: var(--foreground);
		background-color: var(--secondary);
		font-weight: 600;
	}

	/* Right side controls */
	.topnav-right {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		flex-shrink: 0;
	}

	.jump-to-control {
		position: relative;
		display: inline-flex;
		align-items: center;
	}

	.jump-to-control > .sh-kbd {
		position: absolute;
		inset-inline-end: var(--ax-space-8);
		pointer-events: none;
	}

	.jump-to-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-8);
		height: var(--ax-space-32);
		min-width: 11.5rem;
		padding: 0 var(--ax-space-64) 0 var(--ax-space-10);
		border-radius: calc(var(--radius) - 2px);
		border: 1px solid var(--border);
		background-color: var(--background);
		color: var(--muted-foreground);
		font-size: var(--ax-font-size-small);
		cursor: pointer;
		transition:
			border-color 120ms ease,
			color 120ms ease;
	}

	.jump-to-btn:hover {
		border-color: var(--border-strong);
		color: var(--foreground);
	}

	.jump-to-text {
		flex: 1;
		text-align: left;
		white-space: nowrap;
	}

	.external-links-group {
		display: flex;
		align-items: center;
		gap: var(--ax-space-2);
	}

	.topnav-tool-link {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-4);
		height: var(--ax-space-32);
		padding: 0 var(--ax-space-8);
		border-radius: calc(var(--radius) - 2px);
		color: var(--muted-foreground);
		font-size: var(--sh-font-size-xs);
		font-weight: 500;
		text-decoration: none;
		white-space: nowrap;
		transition:
			color 120ms ease,
			background-color 120ms ease;
	}

	.topnav-tool-link:hover {
		color: var(--foreground);
		background-color: var(--secondary);
		text-decoration: none;
	}

	.topnav-icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--ax-space-32);
		height: var(--ax-space-32);
		border-radius: calc(var(--radius) - 2px);
		border: 1px solid var(--border);
		background-color: var(--background);
		color: var(--muted-foreground);
		cursor: pointer;
		transition:
			color 120ms ease,
			border-color 120ms ease;
	}

	.topnav-icon-btn:hover {
		color: var(--foreground);
		border-color: var(--border-strong);
	}

	.user-pill {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-8);
		height: var(--ax-space-32);
		padding: 0 var(--ax-space-6) 0 var(--ax-space-4);
		border-radius: 9999px;
		border: 1px solid var(--border);
		background-color: var(--background);
	}

	.user-avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--sh-avatar-size-md);
		height: var(--sh-avatar-size-md);
		border-radius: 9999px;
		background: var(--primary-muted);
		color: var(--primary);
		font-size: var(--sh-font-size-micro);
		font-weight: 700;
		flex-shrink: 0;
	}

	.user-name {
		font-size: var(--sh-font-size-xs);
		font-weight: 500;
		color: var(--foreground);
		max-width: 8rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.logout-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--sh-icon-button-size-sm);
		height: var(--sh-icon-button-size-sm);
		border-radius: 9999px;
		color: var(--muted-foreground);
		text-decoration: none;
		transition:
			background-color 120ms ease,
			color 120ms ease;
	}

	.logout-link:hover {
		background-color: var(--destructive-muted);
		color: var(--destructive);
	}

	.mobile-menu-btn {
		display: none;
		align-items: center;
		justify-content: center;
		width: var(--ax-space-32);
		height: var(--ax-space-32);
		border-radius: calc(var(--radius) - 2px);
		border: 1px solid var(--border);
		background-color: var(--background);
		color: var(--foreground);
		cursor: pointer;
	}

	.sh-body {
		display: flex;
		flex: 1;
		min-width: 0;
	}

	.sh-workspace {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.sh-content-area {
		flex: 1;
		min-width: 0;
		width: 100%;
		max-width: 1480px;
		margin: 0 auto;
		padding: var(--ax-space-24) var(--ax-space-32) var(--ax-space-48) var(--ax-space-32);
		box-sizing: border-box;
		scroll-margin-top: var(--ax-space-64);
	}

	@media (max-width: 1600px) {
		.external-links-group,
		.user-name {
			display: none;
		}

		.jump-to-btn {
			min-width: auto;
		}
	}

	@media (max-width: 1120px) {
		.brand-title {
			display: none;
		}
	}

	@media (max-width: 960px) {
		.mobile-menu-btn {
			display: inline-flex;
		}

		.tenant-nav {
			display: none;
		}

		.sh-topnav {
			padding: 0 var(--ax-space-14);
		}

		.sh-content-area {
			padding: var(--ax-space-16) var(--ax-space-16) var(--ax-space-40) var(--ax-space-16);
		}
	}

	@media (max-width: 640px) {
		.sh-topnav {
			gap: var(--ax-space-8);
		}

		.topnav-left,
		.topnav-right {
			gap: var(--ax-space-4);
		}

		.topnav-slash,
		.switcher-avatar,
		.user-avatar,
		.jump-to-text,
		.jump-to-control .sh-kbd {
			display: none;
		}

		.jump-to-btn {
			padding-inline: var(--ax-space-10);
		}

		.team-switcher-container {
			min-width: 0;
			flex-shrink: 1;
		}

		.team-switcher-trigger {
			max-width: 100%;
		}

		.switcher-label {
			min-width: 0;
		}

		.user-pill {
			padding: 0;
		}

		.logout-link {
			width: var(--ax-space-32);
			height: var(--ax-space-32);
		}
	}
</style>
