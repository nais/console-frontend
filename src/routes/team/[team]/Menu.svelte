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

	const Inventory = $derived(
		graphql(`
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
					}
				}
			}
		`)
	);

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
</script>

<Menu
	items={menuItems({
		path: page.url.pathname,
		member,
		inventory: $Inventory.fetching ? undefined : $Inventory.data?.team.inventoryCounts,
		features,
		isAdmin
	})}
/>
