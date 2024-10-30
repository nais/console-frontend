<script lang="ts">
	import { graphql, type SearchQuery$result, type TeamSearchQuery$result } from '$houdini';
	import SearchResults from '$lib/SearchResults.svelte';
	import { logEvent } from '$lib/amplitude';
	import { Search } from '@nais/ds-svelte-community';

	const store = graphql(`
		query TeamSearchQuery($query: String!) @loading(cascade: true) {
			search(first: 10, filter: { query: $query, type: TEAM }) {
				nodes @loading(count: 10) {
					__typename
					... on Team {
						slug
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
	) => void = () => {
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
				store.fetch({ variables: { query: query } });
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

	// This is a quick hack to support allow SearchResults to accept a subset of the expected data.
	// It allows our types to handle only teams, while the component expects all other possible types as well.
	function hack(data: TeamSearchQuery$result) {
		return data as never;
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
		<SearchResults {showSearch} data={hack($store.data)} {onSelected} bind:query {selected} />
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
