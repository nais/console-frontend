<script lang="ts">
	import { goto } from '$app/navigation';
	import { PersonGroup } from '@nais/ds-svelte/icons';
	import { Search } from '@nais/ds-svelte';
	import type { PageData } from './$houdini';
	import Logo from '../../Logo.svelte';
	import Card from '$lib/Card.svelte';
	import Time from '$lib/Time.svelte';
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
			No results matching "{q}"
		{/if}

		{#each $SearchPage.data.search.edges as { node }, i}
			{#if node.__typename === 'App'}
				<div style="border-bottom: 1px solid silver; padding-bottom: 0.5rem">
					<a href="/team/{node.team.name}/{node.env.name}/{node.name}">
						<div class="result">
							<div class="resultLeft">
								<div class="typeIcon">
									<Logo height="1.5rem" />
									<div>App</div>
								</div>

								<h3>{node.name}</h3>
							</div>
							<div class="statz">
								<div>
									<div class="stat">
										{node.env.name}
									</div>
									<div class="title">Environment</div>
								</div>
								<div>
									<div class="stat">
										{node.team.name}
									</div>
									<div class="title">Team</div>
								</div>
								<div>
									<div class="stat">
										{node.instances.length}
									</div>
									<div class="title"># of instances</div>
								</div>
								<div>
									<div class="stat">
										{#if node.deployed}
											<Time time={node.deployed} distance={true} />
										{:else}
											Never
										{/if}
									</div>
									<div class="title">Last deployed</div>
								</div>
							</div>
						</div>
					</a>
				</div>
			{:else if node.__typename === 'Team'}
				<div style="border-bottom: 1px solid silver; padding-bottom: 0.5rem">
					<a href="/team/{node.name}">
						<div class="result">
							<div class="resultLeft">
								<div class="typeIcon">
									<PersonGroup size="1.5rem" />
									<div>Team</div>
								</div>
								<div class="team">
									<h3>
										{node.name}
									</h3>
									<div class="teamDescription">
										{node.description}
									</div>
								</div>
							</div>

							<div class="statz">
								<div>
									<div class="stat">
										{node.members.totalCount}
									</div>
									<div class="title">Apps</div>
								</div>

								<div>
									<div class="stat">
										{node.members.totalCount}
									</div>
									<div class="title">Members</div>
								</div>
							</div>
						</div>
					</a>
				</div>
			{/if}
			<hr style="border-bottom: 1px solid gold" />
		{/each}
	</div>
{/if}

<style>
	a {
		text-decoration: none;
		color: var(--a-text-default);
	}
	h3 {
		margin-bottom: 0;
		line-height: 1rem;
	}
	.statz {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}
	.stat {
		font-size: 1.5rem;
		white-space: nowrap;
		width: 100%;
	}
	.title {
		font-size: 0.75rem;
		color: var(--a-text-subtle);
		white-space: nowrap;
	}
	.team {
		display: flex;
		flex-direction: column;
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
		width: 50vw;
		margin: 0 auto;
	}
	.result {
		text-decoration: none;
		display: flex;
		gap: 0.5rem;
		justify-content: space-between;
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
	.resultLeft {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 1rem;
	}
</style>
