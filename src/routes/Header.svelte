<script lang="ts">
	import { Search } from '@nais/ds-svelte';
	import Logo from '../Logo.svelte';
	import { graphql } from '$houdini';
	import SearchResults from '$lib/SearchResults.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	const store = graphql(`
		query SearchQuery($query: String!, $type: SearchType) {
			search(first: 10, query: $query, filter: { type: $type }) {
				edges {
					node {
						__typename
						... on App {
							name
							team {
								name
							}
							env {
								name
							}
						}
						... on Team {
							name
						}
					}
				}
			}
		}
	`);

	export let user:
		| {
				readonly name: string;
				readonly email: string;
		  }
		| undefined;

	let query = '';
	let selected = -1;
	let showSearch = false;
	let timeout: ReturnType<typeof setTimeout> | null = null;

	$: {
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
		if (query.length > 0) {
			showSearch = true;
			timeout = setTimeout(() => {
				store.fetch({ variables: { query } });
			}, 500);
		}
	}
	$: subpage = $page.url.pathname;
</script>

<div class="header">
	<div class="header-content">
		<div class="header-left">
			<a href="/" class="logo">
				<Logo height="2rem" />
				Console
			</a>
			{#if !subpage.startsWith('/search')}
				<form
					class="search"
					method="get"
					action="/search"
					on:submit|preventDefault={() => goto(`/search?q=${query}`)}
				>
					<Search
						bind:value={query}
						label="search"
						variant="simple"
						size="small"
						description="Search for anything"
						on:blur={() => {
							setTimeout(() => {
								showSearch = false;
							}, 100);
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
						on:keyup={(e: KeyEvent) => {
							if (e.key === 'ArrowDown') {
								selected += 1;
							}
							if (e.key === 'ArrowUp') {
								selected -= 1;
							}
							selected = Math.min(
								($store.data?.search.edges.length || 0) - 1,
								Math.max(-1, selected)
							);
							if (e.key === 'Enter') {
								if (selected >= 0) {
									const node = $store.data?.search.edges[selected].node;
									if (!node) return;
									query = '';
									selected = -1;
									if (node.__typename === 'App') {
										goto(`/team/${node.team.name}/${node.env.name}/${node.name}`);
									} else if (node.__typename === 'Team') {
										goto(`/team/${node.name}`);
									}
								}
							}
						}}
					/>
					{#if $store.fetching}
						<div class="loading">Loading...</div>
					{/if}
					{#if $store.data && showSearch}
						<SearchResults data={$store.data} {query} {selected} />
					{/if}
				</form>
			{/if}
		</div>
		<nav>
			<ul>
				<li><a href="/teams">Teams</a></li>
				<li><a href="/apps">Workloads</a></li>
				<li><a href="/deploys">Deploys</a></li>
				<li><a href="https://docs.nais.io">Docs</a></li>
			</ul>
		</nav>
		<div class="cap">{user ? user.name : 'unauthorized'}</div>
	</div>
</div>

<style>
	.cap {
		text-transform: capitalize;
	}
	.header-left {
		display: flex;
		gap: 2rem;
	}
	.search {
		position: relative;
		width: 250px;
	}
	.header {
		background: var(--a-surface-inverted);
		color: var(--a-text-on-inverted);
		height: 3rem;
		display: flex;
		align-items: center;
		padding: 0 2rem;
		margin-bottom: 2rem;
		min-width: 1000px;
	}
	.header-content {
		margin: 0 auto;
		width: 100%;
		height: 100%;
		max-width: 1400px;
		display: flex;
		align-items: center;
		flex-direction: row;
		justify-content: space-between;
	}
	.logo {
		color: var(--a-text-on-inverted);
		text-decoration: none;
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 1.5rem;
		font-weight: bold;
	}
	nav {
		height: 100%;
	}
	ul {
		height: 100%;
		display: flex;
		align-items: stretch;
		flex-direction: row;
		margin: 0;
		padding: 0;
	}
	li {
		display: flex;
		list-style: none;
		align-items: stretch;
	}
	li > a {
		text-decoration: none;
		color: var(--a-text-on-inverted);
		background-color: var(--a-surface-inverted);
		display: flex;
		align-items: center;
		padding: 0 1rem;
	}
	li > a:hover {
		background-color: var(--a-surface-inverted-hover);
	}
</style>
