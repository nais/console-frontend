<script lang="ts">
	import { page } from '$app/state';
	import { menuItems } from '$lib/menuItems';
	import Menu from '$lib/ui/Menu.svelte';
	import { getContextClient } from '$lib/urql/context';
	import { graphql as gql } from '$lib/urql/gql';
	import { queryStore } from '@urql/svelte';
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

	const InventoryQuery = gql(/* GraphQL */ `
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

	const client = getContextClient();

	const inventory = $derived(
		queryStore({
			client,
			query: InventoryQuery,
			variables: { team: teamSlug },
			requestPolicy: 'cache-and-network'
		})
	);

	const result = $derived($inventory);

	setInventoryRefetcher(() => {
		// Re-issue the query bypassing the cache; the queryStore subscribed
		// above will receive the fresh result through the normalized cache.
		client.query(InventoryQuery, { team: teamSlug }, { requestPolicy: 'network-only' }).toPromise();
	});
</script>

<Menu
	items={menuItems({
		path: page.url.pathname,
		member,
		inventory: result.fetching ? undefined : result.data?.team.inventoryCounts,
		features,
		isAdmin
	})}
/>
