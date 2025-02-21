<script lang="ts">
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import Menu from '$lib/components/Menu.svelte';
	import { menuItems } from '$lib/menuItems';
	import type { InventoryVariables } from './$houdini';

	const {
		member,
		features,
		teamSlug
	}: {
		member: boolean;
		features?: {
			unleash: { enabled: boolean };
			redis: { enabled: boolean };
			valkey: { enabled: boolean };
			kafka: { enabled: boolean };
			openSearch: { enabled: boolean };
		};
		teamSlug: string;
	} = $props();

	export const _InventoryVariables: InventoryVariables = () => {
		return { team: teamSlug };
	};

	const Inventory = $derived(
		graphql(`
			query Inventory($team: Slug!) @load {
				team(slug: $team) {
					inventoryCounts {
						applications {
							total
							notNais
						}
						jobs {
							total
							notNais
						}
						sqlInstances {
							total
						}
						buckets {
							total
						}
						redisInstances {
							total
						}
						valkeyInstances {
							total
						}
						openSearchInstances {
							total
						}
						kafkaTopics {
							total
						}
						bigQueryDatasets {
							total
						}
					}
				}
			}
		`)
	);
</script>

<Menu
	items={menuItems({
		path: page.url.pathname,
		member,
		inventory: $Inventory.fetching ? undefined : $Inventory.data?.team.inventoryCounts,
		features
	})}
/>
