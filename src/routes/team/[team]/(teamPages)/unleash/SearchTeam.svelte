<script lang="ts">
	import { graphql } from '$houdini';

	const teamSearch = graphql(`
		query TeamSearchQuery($query: String!) @loading(cascade: true) {
			search(first: 10, filter: { query: $query, type: TEAM }) {
				nodes {
					__typename
					... on Team {
						slug
						purpose
					}
				}
			}
		}
	`);

	const teamsQuery = graphql(`
		query Teams {
			teams(first: 25) {
				nodes {
					slug
					purpose
				}
			}
		}
	`);

	let {
		open = $bindable(),
		addTeam,
		removeTeam
	}: {
		open: boolean;
		addTeam: (teamname: string) => Promise<void>;
		removeTeam: (teamname: string) => Promise<void>;
	} = $props();

	function searchTeam() {
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
		if (query.length > 0) {
			showSearch = true;
			timeout = setTimeout(() => {
				store.fetch({ variables: { query: query } });
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
		oninput={searchTeam}
	/>
	{#if $store.data && showSearch}
		<!-- <SearchResults {showSearch} data={hack($store.data)} {onSelected} bind:query {selected} /> -->
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
