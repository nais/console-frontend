<script lang="ts">
	import { run } from 'svelte/legacy';

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

	let selected = $state(-1);
	let showSearch = $state(false);
	let timeout: ReturnType<typeof setTimeout> | null = $state(null);

	interface Props {
		query?: string;
		onSelected?: (
			node: SearchQuery$result['search']['nodes'][0],
			e: MouseEvent | KeyboardEvent
		) => void;
	}

	let {
		query = $bindable(''),
		onSelected = () => {
			query = '';
			showSearch = false;
		}
	}: Props = $props();

	run(() => {
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
	});

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
		onblur={() => {
			setTimeout(() => {
				showSearch = false;
			}, 200);
		}}
		onclear={() => {
			query = '';
			showSearch = false;
		}}
		onfocus={() => {
			if (query.length > 0) {
				showSearch = true;
			}
		}}
		onkeyup={on_key_up}
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
