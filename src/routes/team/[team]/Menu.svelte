<script lang="ts">
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import Menu from '$lib/components/Menu.svelte';
	import { menuItems } from '$lib/menuItems';

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
			query Inventory($team: Slug!) {
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

	$effect.pre(() => {
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
