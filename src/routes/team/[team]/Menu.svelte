<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { menuItems } from '$lib/menuItems';
	import Icon from '$lib/ui/Icon.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import Menu from '$lib/ui/Menu.svelte';
	import MobileSideDrawer from '$lib/ui/MobileSideDrawer.svelte';
	import { getTeamContext } from './teamContext.svelte';

	const {
		member,
		isAdmin,
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
			member,
			features,
			isAdmin
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

<nav class="team-menu" aria-label="Team menu">
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
					<IconLabel>
						{#snippet label()}
							<span class="label">{overviewItem.label}</span>
						{/snippet}
						{#snippet icon()}
							<span class="icon"><Icon icon={overviewItem.label} /></span>
						{/snippet}
					</IconLabel>
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
		display: block;
		min-width: 0;
		border-radius: 4px;
		padding: var(--ax-space-4) var(--ax-space-8);
		text-decoration: none;
		color: inherit;
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

		&.active .icon {
			color: var(--ax-text-subtle);
		}

		&:not(.active) .icon {
			color: var(--ax-text-subtle);
		}

		.icon {
			display: contents;
		}
	}

	@media (max-width: 768px), (max-height: 500px) {
		.desktop-menu {
			display: none;
		}
	}
</style>
