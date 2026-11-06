<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { menuItems } from '#lib/menuItems.js';
	import type { TenantNavigationItem } from '#lib/tenantNavigation.js';
	import Icon from '#lib/ui/Icon.svelte';
	import ErrorIndicator from '#lib/ui/ErrorIndicator.svelte';
	import { ChevronLeftIcon, ChevronRightIcon } from '#lib/icons/index.js';
	import { onMount } from 'svelte';
	import Heading from './Heading.svelte';
	import Modal from './Modal.svelte';

	interface Props {
		features?: {
			unleash: { enabled: boolean };
			valkey: { enabled: boolean };
			kafka: { enabled: boolean };
			openSearch: { enabled: boolean };
		};
		collapsed?: boolean;
		mobileOpen?: boolean;
		tenantItems: TenantNavigationItem[];
	}

	const uid = $props.id();

	let {
		features,
		tenantItems,
		collapsed = $bindable(false),
		mobileOpen = $bindable(false)
	}: Props = $props();

	const currentTeamSlug = $derived(page.params.team);

	const teamGroups = $derived.by(() => {
		if (!currentTeamSlug) return [];
		const raw = menuItems({
			path: page.url.pathname,
			features
		});
		const labels = [
			'Workspace',
			'Workloads',
			'Data & Config',
			'Operations & Security',
			'Team Management'
		];
		return raw.map((group, idx) => ({
			title: labels[idx] ?? 'Resources',
			items: group
		}));
	});

	afterNavigate(() => {
		mobileOpen = false;
	});

	onMount(() => {
		const mobileViewport = window.matchMedia('(max-width: 960px)');
		const closeOnDesktop = () => {
			if (!mobileViewport.matches) mobileOpen = false;
		};
		closeOnDesktop();
		mobileViewport.addEventListener('change', closeOnDesktop);
		return () => mobileViewport.removeEventListener('change', closeOnDesktop);
	});
</script>

{#snippet teamLinks(compact: boolean)}
	{#each teamGroups as group (group.title)}
		<div class="nav-group">
			{#if !compact}
				<div class="nav-group-label">{group.title}</div>
			{/if}
			<ul class="nav-list">
				{#each group.items as item (item.href)}
					<li>
						<a
							href={item.href}
							class={['nav-item', { active: item.active }]}
							aria-current={item.active ? 'page' : undefined}
							aria-label={compact ? item.label : undefined}
							title={compact ? item.label : undefined}
						>
							<span class="nav-icon" aria-hidden="true"><Icon icon={item.label} /></span>
							{#if !compact}
								<span class="nav-label">{item.label}</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
{/snippet}

{#if currentTeamSlug}
	<aside class={['sh-sidebar', { collapsed }]} aria-label="Team navigation">
		<nav class="sidebar-scroll" aria-label={`Team: ${currentTeamSlug}`}>
			{@render teamLinks(collapsed)}
		</nav>

		<div class="sidebar-bottom">
			<button
				type="button"
				class="collapse-btn"
				aria-label={collapsed ? 'Expand team sidebar' : 'Collapse team sidebar'}
				title={collapsed ? 'Expand team sidebar' : 'Collapse team sidebar'}
				onclick={() => (collapsed = !collapsed)}
			>
				{#if collapsed}
					<ChevronRightIcon aria-hidden="true" />
				{:else}
					<ChevronLeftIcon aria-hidden="true" />
					<span>Collapse</span>
				{/if}
			</button>
		</div>
	</aside>
{/if}

<Modal
	bind:open={mobileOpen}
	header={{ heading: 'Navigation', size: 'small' }}
	class="navigation-drawer"
>
	<div class="mobile-navigation-content">
		<nav class="navigation-section tenant-navigation" aria-labelledby={`${uid}-tenant`}>
			<Heading as="h3" size="small" id={`${uid}-tenant`}>Tenant</Heading>
			<ul class="nav-list">
				{#each tenantItems as item (item.href)}
					<li>
						<a
							href={item.href}
							class={['nav-item', { active: item.active }]}
							aria-current={item.active ? 'page' : undefined}
						>
							{item.label}
							{#if item.error}
								<ErrorIndicator label={item.error} />
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
		{#if currentTeamSlug}
			<nav class="navigation-section" aria-labelledby={`${uid}-team`}>
				<Heading as="h3" size="small" id={`${uid}-team`}>Team: {currentTeamSlug}</Heading>
				{@render teamLinks(false)}
			</nav>
		{/if}
	</div>
</Modal>

<style>
	.sh-sidebar {
		position: sticky;
		top: var(--ax-space-56);
		height: calc(100vh - var(--ax-space-56));
		width: var(--sh-sidebar-menu-width);
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		background-color: var(--sidebar-background);
		color: var(--sidebar-foreground);
		border-right: var(--sh-border-width) solid var(--sidebar-border);
		z-index: 30;
		transition: width 160ms cubic-bezier(0.16, 1, 0.3, 1);
		user-select: none;
	}

	.sh-sidebar.collapsed {
		width: var(--sidebar-width-collapsed);
	}

	.sidebar-bottom {
		padding: var(--ax-space-8);
		border-top: var(--sh-border-width) solid var(--sidebar-border);
		display: flex;
		justify-content: flex-end;
	}

	.sh-sidebar.collapsed .sidebar-bottom {
		justify-content: center;
	}

	.collapse-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-6);
		height: var(--ax-space-28);
		padding: 0 var(--ax-space-8);
		border-radius: var(--radius-xs);
		border: var(--sh-border-width) solid transparent;
		background: transparent;
		color: var(--sidebar-muted);
		font-size: var(--sh-font-size-xs);
		font-weight: var(--sh-font-weight-medium);
		cursor: pointer;
		flex-shrink: 0;
		transition:
			background-color 120ms ease,
			color 120ms ease;
	}

	.collapse-btn:hover {
		background-color: var(--sidebar-accent);
		color: var(--foreground);
	}

	.sidebar-scroll {
		flex: 1;
		overflow-y: auto;
		padding: var(--ax-space-10) var(--ax-space-8) var(--ax-space-16) var(--ax-space-8);
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-14);
		scrollbar-width: thin;
	}

	.nav-group {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-2);
	}

	.nav-group-label {
		padding: var(--ax-space-2) var(--ax-space-8);
		font-size: var(--sh-font-size-xs);
		font-weight: var(--sh-font-weight-medium);
		color: var(--sidebar-muted);
	}

	.nav-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-1);
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		padding: var(--ax-space-6) var(--ax-space-8);
		border-radius: var(--radius-xs);
		color: var(--sidebar-foreground);
		text-decoration: none;
		font-size: var(--sh-font-size-sm);
		font-weight: var(--sh-font-weight-medium);
		transition:
			background-color 110ms ease,
			color 110ms ease;
	}

	.sh-sidebar.collapsed .nav-item {
		justify-content: center;
		padding: var(--ax-space-8);
	}

	.nav-item:hover {
		background-color: var(--sidebar-accent);
		color: var(--sidebar-accent-foreground);
		text-decoration: none;
	}

	.nav-item.active {
		background-color: var(--sidebar-accent);
		color: var(--sidebar-accent-foreground);
		font-weight: var(--sh-font-weight-semibold);
	}

	.nav-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--ax-space-18);
		height: var(--ax-space-18);
		font-size: var(--sh-font-size-base);
		color: var(--sidebar-muted);
		flex-shrink: 0;
	}

	.nav-item:hover .nav-icon,
	.nav-item.active .nav-icon {
		color: currentColor;
	}

	.nav-label {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	@media (max-width: 960px) {
		.sh-sidebar {
			display: none;
		}
	}

	:global(.navigation-drawer.sh-modal) {
		position: fixed;
		inset: 0 auto 0 0;
		margin: 0;
		display: flex;
		width: var(--sh-sidebar-menu-wide-width);
		max-width: calc(100vw - var(--ax-space-16));
		height: 100dvh;
		max-height: 100dvh;
		flex-direction: column;
		border: none;
		border-radius: 0;
		background-color: var(--sidebar-background);
		color: var(--sidebar-foreground);
	}

	:global(.navigation-drawer .sh-modal__body) {
		flex: 1;
		min-height: 0;
		padding: var(--ax-space-16);
		overflow-y: auto;
	}

	.mobile-navigation-content {
		display: grid;
		gap: var(--ax-space-24);
	}

	.navigation-section {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-14);
		min-width: 0;
	}

	:global(.navigation-drawer .sh-heading) {
		overflow-wrap: anywhere;
	}

	.tenant-navigation {
		padding-bottom: var(--ax-space-24);
		border-bottom: var(--sh-border-width) solid var(--sidebar-border);
	}

	@media (min-width: 961px) {
		:global(.navigation-drawer.sh-modal) {
			display: none;
		}
	}
</style>
