<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { menuItems } from '$lib/menuItems';
	import Icon from '$lib/ui/Icon.svelte';
	import Menu from '$lib/ui/Menu.svelte';
	import MobileSideDrawer from '$lib/ui/MobileSideDrawer.svelte';
	import { getTeamContext } from './teamContext.svelte';
	import TeamSwitcher from './TeamSwitcher.svelte';

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

	const currentTeam = $derived(page.params.team);

	let switcherOpen = $state(false);

	function onKeydown(e: KeyboardEvent) {
		const target = e.target as HTMLElement;
		if (
			target.tagName === 'INPUT' ||
			target.tagName === 'TEXTAREA' ||
			target.tagName === 'SELECT'
		) {
			return;
		}
		if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
			e.preventDefault();
			switcherOpen = true;
		}
	}

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

	afterNavigate(() => {
		teamContext.closeMobileMenu();
	});
</script>

<svelte:document onkeydown={onKeydown} />

<TeamSwitcher bind:open={switcherOpen} />

<nav class="team-menu" aria-label="Team menu">
	<button class="team-picker" onclick={() => (switcherOpen = true)}>
		<span class="team-name">{currentTeam}</span>
		<kbd class="shortcut">/</kbd>
	</button>
	<div class="desktop-menu">
		<Menu {items} />
	</div>
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
	.team-picker {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: var(--ax-space-8) var(--ax-space-12);
		margin-bottom: var(--ax-space-12);
		border: 1px solid var(--ax-border-neutral-subtleA);
		border-radius: var(--ax-radius-8);
		background: transparent;
		cursor: pointer;
		color: inherit;
		transition: border-color 100ms;

		&:hover {
			border-color: var(--ax-text-neutral-subtle);
		}

		&:focus-visible {
			outline: 2px solid var(--surface-accent-color);
			outline-offset: 1px;
		}
	}

	.team-name {
		font-size: var(--ax-font-size-medium);
		font-weight: var(--ax-font-weight-bold);
	}

	.shortcut {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral-subtle);
		border: 1px solid var(--ax-border-neutral-subtleA);
		border-radius: var(--ax-radius-4);
		padding: var(--ax-space-1) var(--ax-space-4);
		font-family: inherit;
		line-height: 1;
	}

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
