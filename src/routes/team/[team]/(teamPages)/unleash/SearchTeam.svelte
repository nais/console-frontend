<script lang="ts">
	import { Search } from '@nais/ds-svelte-community';
	import { graphql, type SearchQuery$result } from '$houdini';
	import SearchResults from '$lib/SearchResults.svelte';
	import { logEvent } from '$lib/amplitude';

	const store = graphql(`
		query TeamSearchQuery($query: String!, $type: SearchType) @loading(cascade: true) {
			search(limit: 10, query: $query, filter: { type: $type }) {
				nodes @loading(count: 10) {
					__typename
					... on App {
						name
						team {
							slug
						}
						env {
							name
						}
					}
					... on Team {
						slug
					}
					... on NaisJob {
						name
						team {
							slug
						}
						env {
							name
						}
					}
					... on SqlInstance {
						name
						team {
							slug
						}
						env {
							name
						}
					}
					... on Redis {
						name
						team {
							slug
						}
						env {
							name
						}
					}
					... on OpenSearch {
						name
						team {
							slug
						}
						env {
							name
						}
					}
					... on BigQueryDataset {
						name
						team {
							slug
						}
						env {
							name
						}
					}
					... on Bucket {
						name
						team {
							slug
						}
						env {
							name
						}
					}
					... on KafkaTopic {
						name
						team {
							slug
						}
						env {
							name
						}
					}
				}
			}
		}
	`);

	export let query = '';
	let selected = -1;
	let showSearch = false;
	let timeout: ReturnType<typeof setTimeout> | null = null;

	export let onSelected: (
		node: SearchQuery$result['search']['nodes'][0],
		e: MouseEvent | KeyboardEvent
	) => void = (node, e) => {
		query = '';
		showSearch = false;
	};

	$: {
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
		if (query.length > 0) {
			showSearch = true;
			timeout = setTimeout(() => {
				store.fetch({ variables: { query: query, type: 'TEAM' } });
				logEvent('search');
			}, 500);
		}
	}

	function on_key_up(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowDown':
				selected += 1;
				selected = Math.min(($store.data?.search.nodes.length || 0) - 1, Math.max(-1, selected));
				event.preventDefault();
				break;
			case 'ArrowUp':
				selected -= 1;
				selected = Math.min(($store.data?.search.nodes.length || 0) - 1, Math.max(-1, selected));
				event.preventDefault();
				break;
			case 'Enter':
				if (selected >= 0) {
					const node = $store.data?.search.nodes[selected];
					if (!node) return;
					showSearch = false;
					selected = -1;

					if (node.__typename === 'Team') {
						onSelected(node, event);
					}
				}
				break;
			case 'Escape':
				showSearch = false;
				query = '';
				break;
		}
	}
</script>

<div class="search">
	<Search
		placeholder="Search for teams..."
		bind:value={query}
		label="search"
		variant="simple"
		size="small"
		on:blur={() => {
			setTimeout(() => {
				showSearch = false;
			}, 200);
		}}
		on:clear={() => {
			query = '';
			showSearch = false;
		}}
		on:focus={() => {
			if (query.length > 0) {
				showSearch = true;
			}
		}}
		on:keyup={on_key_up}
	/>
	{#if $store.data && showSearch}
		<SearchResults {showSearch} data={$store.data} {onSelected} bind:query {selected} />
	{/if}
</div>

<style>
	.search {
		display: inline-block;
		position: relative;
		width: 350px;
		color: black;
	}
</style>
