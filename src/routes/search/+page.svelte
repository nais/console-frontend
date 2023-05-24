<script lang="ts">
	import { goto } from '$app/navigation';
	import { PersonGroup } from '@nais/ds-svelte/icons';
	import { Search } from '@nais/ds-svelte';
	import type { PageData } from './$houdini';
	import Logo from '../../Logo.svelte';
	import Card from '$lib/Card.svelte';
	export let data: PageData;
	$: ({ SearchPage, query } = data);

	$: q = query;
</script>

<form
	class="search"
	method="get"
	action="/search"
	on:submit|preventDefault={() => goto(`/search?q=${q}`)}
>
	<div class="searchBox">
		<div>
			<Search
				label="search"
				variant="primary"
				size="medium"
				description="Search for anything"
				bind:value={q}
			/>
		</div>
	</div>
</form>
{#if $SearchPage.data}
	<div class="results">
		{#if $SearchPage.data.search.edges.length === 0}
			<Card>
				No results matching "{q}"
			</Card>
		{/if}
		{#each $SearchPage.data.search.edges as { node }, i}
			{#if node.__typename === 'App'}
				<a href="/team/{node.team.name}/{node.env.name}/{node.name}">
					<Card>
						<div class="result">
							<div class="typeIcon">
								<Logo height="1.5rem" />
								<div>App</div>
							</div>
							<div>
								<div>
									{node.name}
								</div>

								<div class="searchInfo">
									{node.env.name} /
									{node.team.name}
								</div>
							</div>
						</div>
					</Card>
				</a>
			{:else if node.__typename === 'Team'}
				<a href="/team/{node.name}">
					<Card>
						<div class="result">
							<div>
								<div class="typeIcon">
									<PersonGroup size="1.5rem" />
									<div>Team</div>
								</div>
								<div class="team">
									<div class="teamName">
										{node.name}
									</div>
									<div class="teamDescription">
										{node.description}
									</div>
								</div>
							</div>

							<div class="statz">
								<div>
									<div class="title">Apps</div>
									<div class="stat">
										{node.members.totalCount}
									</div>
								</div>

								<div>
									<div class="title">Members</div>
									<div class="stat">
										{node.members.totalCount}
									</div>
								</div>
							</div>
						</div>
					</Card>
				</a>
			{/if}
		{/each}
	</div>
{/if}

<style>
	a {
		text-decoration: none;
		color: var(--a-text-default);
	}
	.statz {
		display: flex;
		flex-direction: row;
		align-items: flex-end;
		gap: 0.5rem;
	}
	.stat {
		font-size: 1.5rem;
	}
	.title {
		font-size: 0.75rem;
		color: var(--a-text-subtle);
	}
	.team {
		display: flex;
		flex-direction: column;
	}
	.teamName {
		font-weight: 600;
	}
	.teamDescription {
		color: var(--a-text-subtle);
		font-style: italic;
	}
	.searchBox {
		display: flex;
		justify-content: center;
		margin-bottom: 2rem;
	}
	.searchBox > div {
		width: 600px;
	}
	.results {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		justify-content: space-between;
	}
	.result {
		text-decoration: none;
		display: flex;
		flex-direction: row;
		justify-items: space-between;
		gap: 0.5rem;
	}
	.searchInfo {
		font-size: 0.75rem;
		color: var(--a-text-subtle);
	}
	.typeIcon {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 30px;
		color: var(--a-text-subtle);
	}
	.typeIcon > div {
		font-size: 0.75rem;
	}
</style>
