<script lang="ts">
	import { favorites } from '$lib/stores/favorites.svelte';
	import { pathToFavoriteLabel } from '$lib/urlToPageHeader';
	import { Heading } from '@nais/ds-svelte-community';
</script>

<div class="favorites-list">
	<Heading level="2">My Favorites</Heading>
	<ul>
		{#each favorites.getFavorites() as fav (fav)}
			<li>
				<a href={fav}>
					{pathToFavoriteLabel(fav)}
				</a>
			</li>
		{:else}
			<li>No favorites added yet. Document me!</li>
		{/each}
	</ul>
</div>

<style>
	.favorites-list {
		background-color: var(--ax-bg-secondary);
		padding: var(--ax-space-4);
		border-radius: var(--ax-border-radius);
		margin-top: var(--ax-space-16);
	}

	.favorites-list ul {
		list-style-type: none;
		padding: 0;
		margin: 0;
	}

	.favorites-list li {
		margin-bottom: var(--ax-space-2);
	}
</style>
