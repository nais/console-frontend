<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { menuItems } from '#lib/menuItems.js';
	import Icon from '#lib/ui/Icon.svelte';
	import Menu from '#lib/ui/Menu.svelte';
	import MobileSideDrawer from '#lib/ui/MobileSideDrawer.svelte';
	import { getTeamContext } from './teamContext.svelte';

	const {
		features
	}: {
		member: boolean;
		isAdmin: boolean;
		features?: {
			unleash: { enabled: boolean };
			valkey: { enabled: boolean };
			kafka: { enabled: boolean };
			openSearch: { enabled: boolean };
		};
	} = $props();

	const items = $derived(
		menuItems({
			path: page.url.pathname,
			features
		})
	);

	const teamContext = getTeamContext();
	const overviewItem = $derived(items[0]?.[0]);
	const navigationItems = $derived(overviewItem ? items.slice(1) : items);

	const activeLabel = $derived(
		items.flat().find((item) => item.active)?.label ?? 'Team navigation'
	);
	afterNavigate(({ shallow }) => {
		if (shallow) return;

		teamContext.closeMobileMenu();
	});
</script>

<nav class="team-menu" aria-label="Team menu">
	<div class="desktop-menu"><Menu {items} /></div>

	{#if overviewItem}
		<MobileSideDrawer bind:open={teamContext.mobileMenuOpen} id="team-menu-items">
			{#snippet headerContent()}
				<a
					href={overviewItem.href}
					class="overview-link"
					class:active={overviewItem.active}
					onclick={() => teamContext.closeMobileMenu()}
				>
					<span class="icon-box"><Icon icon={overviewItem.label} /></span>
					<span class="label">{overviewItem.label}</span>
				</a>
			{/snippet}
			<Menu items={navigationItems} onItemSelect={() => teamContext.closeMobileMenu()} />
		</MobileSideDrawer>
	{:else}
		<MobileSideDrawer
			bind:open={teamContext.mobileMenuOpen}
			id="team-menu-items"
			title={activeLabel}
		>
			<Menu {items} onItemSelect={() => teamContext.closeMobileMenu()} />
		</MobileSideDrawer>
	{/if}
</nav>

<style>
	.desktop-menu {
		display: block;
	}

	.overview-link {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		min-width: 0;
		border-radius: var(--ax-radius-8);
		padding: var(--ax-space-4) var(--ax-space-8);
		text-decoration: none;
		color: inherit;
		font-size: var(--ax-font-size-medium);
		transition: background-color 50ms;

		&:focus-visible,
		&:hover {
			background-color: color-mix(in oklab, var(--active-color) 60%, transparent);
			box-shadow: none;
			color: inherit;
		}

		&:active {
			background-color: var(--active-color-strong);
			box-shadow: none;
			color: inherit;
		}

		&.active {
			background-color: var(--active-color);
		}

		.icon-box {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 24px;
			height: 24px;
			flex-shrink: 0;
			border-radius: var(--ax-radius-4);
			font-size: 1rem;
			color: var(--ax-text-neutral-subtle);
			background: color-mix(in srgb, var(--ax-text-neutral-subtle) 10%, transparent);
		}

		&.active .icon-box {
			color: var(--surface-accent-color);
			background: color-mix(in srgb, var(--surface-accent-color) 12%, transparent);
		}
	}

	@media (max-width: 768px), (max-height: 500px) {
		.desktop-menu {
			display: none;
		}
	}
</style>
