<script lang="ts">
	import type { SearchQuery$result } from '$houdini';
	import Logo from '../Logo.svelte';
	import { PersonGroup, Funnel } from '@nais/ds-svelte/icons';

	export let data: SearchQuery$result;
	export let query: string;
	export let selected: number;
</script>

<ul>
	{#if data.search.edges.length === 0}
		<li class="nomatch">
			No results matching "{query}"
		</li>
	{/if}
	{#each data.search.edges as { node }, i}
		{#if node.__typename === 'App'}
			<li>
				<a
					class={selected == i ? 'selected' : ''}
					href="/team/{node.team.name}/{node.env.name}/{node.name}"
					on:click={() => {
						query = '';
					}}
				>
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
				</a>
			</li>
		{:else if node.__typename === 'Team'}
			<li>
				<a
					class={selected == i ? 'selected' : ''}
					href="/team/{node.name}"
					on:click={() => {
						query = '';
					}}
				>
					<div class="typeIcon">
						<PersonGroup size="1.5rem" />
						<div>Team</div>
					</div>
					{node.name}</a
				>
			</li>
		{/if}
	{/each}
</ul>

<style>
	.nomatch {
		padding: 1rem 1rem 0 1rem;
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
	ul {
		position: absolute;
		display: flex;
		flex-direction: column;
		top: 100%;
		white-space: nowrap;
		left: 0;
		background-color: var(--a-surface-default);
		outline: 1px solid black;
		border-top: none;
		border-radius: 0 0 0.25rem 0.25rem;
		padding: 0;
		margin: 0;
		color: var(--a-text-default);
		overflow: auto;
	}
	ul::after {
		content: '';
		display: block;
		height: 1rem;
	}

	ul li {
		height: 3rem;
		background-color: var(--a-surface-default);
		color: var(--a-text-default);
	}
	ul li a {
		display: flex;
		padding: 5px 0.75rem;
		background-color: var(--a-surface-default);
		color: black;
		gap: 0.75rem;
		width: 100%;
		min-width: 350px;
		text-decoration: none;
		align-items: center;
	}
	ul li a.selected {
		border: 1px dashed var(--a-blue-600);
		background-color: var(--a-gray-100);
	}

	ul li a:hover {
		background-color: var(--a-gray-100);
	}
	ul li a:hover .typeIcon {
		color: var(--a-gray-900);
	}
</style>
