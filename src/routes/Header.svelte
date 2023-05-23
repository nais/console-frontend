<script lang="ts">
	import { Search } from '@nais/ds-svelte';
	import Logo from '../Logo.svelte';
	import { graphql } from '$houdini';

	import { json } from '@sveltejs/kit';
	import { SearchQueryStore } from '$houdini';

	const store = graphql(`
		query SearchQuery($query: String!) {
			search(first: 10, query: $query) {
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

	let timeout: ReturnType<typeof setTimeout> | null = null;

	$: {
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
		if (query.length > 0) {
			timeout = setTimeout(() => {
				store.fetch({ variables: { query } });
			}, 500);
		}
	}
	$: console.log($store.data);
</script>

<div class="header">
	<div class="header-content">
		<div class="header-left">
			<a href="/" class="logo">
				<Logo height="2rem" />
				Console
			</a>
			<div class="search">
				<Search
					bind:value={query}
					label="search"
					variant="primary"
					size="small"
					description="Search for anything"
				/>
				{#if $store.data && query.length > 0}
					<ul>
						{#each $store.data.search.edges as { node }}
							{#if node.__typename === 'App'}
								<li>
									<a
										href="/team/{node.team.name}/{node.env.name}/{node.name}"
										on:click={() => {
											query = '';
										}}>{node.name} ({node.env.name}/{node.team.name})</a
									>
								</li>
							{:else if node.__typename === 'Team'}
								<li>
									<a
										href="/team/{node.name}"
										on:click={() => {
											query = '';
										}}>{node.name}</a
									>
								</li>
							{/if}
						{/each}
					</ul>
				{/if}
			</div>
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
	.search > ul {
		position: absolute;
		display: flex;
		flex-direction: column;
		top: 100%;
		left: 0;
		width: 100%;
		background-color: white;
		border: 1px solid var(--a-surface-inverted-border);
		border-top: none;
		border-radius: 0 0 0.25rem 0.25rem;
		padding: 0;
		margin: 0;
	}
	.search > ul > li {
		display: flex;
		align-items: center;
		height: 3rem;
		background-color: var(--a-surface-default);
	}
	.search > ul > li > a {
		display: flex;
		align-items: center;
		height: 100%;
		width: 100%;
		padding: 0 1rem;
		background-color: var(--a-surface-default);
		color: black;
	}
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
