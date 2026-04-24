<script lang="ts">
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import { menuItems } from '$lib/menuItems';
	import Menu from '$lib/ui/Menu.svelte';
	import { setInventoryRefetcher } from './teamContext.svelte';

	const {
		member,
		isAdmin,
		features,
		teamSlug
	}: {
		member: boolean;
		isAdmin: boolean;
		features?: {
			unleash: { enabled: boolean };
			valkey: { enabled: boolean };
			kafka: { enabled: boolean };
			openSearch: { enabled: boolean };
		};
		teamSlug: string;
	} = $props();

	const Inventory = graphql(`
		query Inventory($team: Slug!) @cache(policy: CacheAndNetwork) {
			team(slug: $team) {
				inventoryCounts {
					applications {
						total
					}
					jobs {
						total
					}
					sqlInstances {
						total
					}
					buckets {
						total
					}
					valkeys {
						total
					}
					openSearches {
						total
					}
					kafkaTopics {
						total
					}
					bigQueryDatasets {
						total
					}
					postgresInstances {
						total
					}
					secrets {
						total
					}
					configs {
						total
					}
				}
			}
		}
	`);

	$effect(() => {
		Inventory.fetch({
			variables: {
				team: teamSlug
			}
		});
	});

	setInventoryRefetcher(() => {
		Inventory.fetch({
			variables: {
				team: teamSlug
			}
		});
	});

	const items = $derived(
		menuItems({
			path: page.url.pathname,
			member,
			inventory: $Inventory.fetching ? undefined : $Inventory.data?.team.inventoryCounts,
			features,
			isAdmin
		})
	);

	let mobileMenuOpen = $state(false);

	const activeLabel = $derived(
		items.flat().find((item) => item.active)?.label ?? 'Team navigation'
	);

	$effect(() => {
		const pathname = page.url.pathname;
		if (pathname) {
			mobileMenuOpen = false;
		}
	});
</script>

<nav class="team-menu" aria-label="Team menu">
	<button
		type="button"
		class="mobile-menu-toggle"
		onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
		aria-expanded={mobileMenuOpen}
		aria-controls="team-menu-items"
	>
		{activeLabel}
	</button>
	<div id="team-menu-items" class:mobile-hidden={!mobileMenuOpen}>
		<Menu {items} />
	</div>
</nav>

<style>
	.mobile-menu-toggle {
		display: none;
	}

	@media (max-width: 767px) {
		.team-menu {
			display: flex;
			flex-direction: column;
			gap: var(--ax-space-8);
		}

		.mobile-menu-toggle {
			display: block;
			width: 100%;
			text-align: left;
			padding: var(--ax-space-8) var(--ax-space-12);
			border: 1px solid var(--ax-border-neutral-subtleA);
			border-radius: 6px;
			background: var(--ax-bg-raised);
			color: var(--ax-text-neutral);
			font-size: var(--ax-font-size-medium);
			font-weight: var(--ax-font-weight-bold);
		}

		.mobile-hidden {
			display: none;
		}
	}
</style>
