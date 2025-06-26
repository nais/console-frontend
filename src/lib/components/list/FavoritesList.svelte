<script lang="ts">
	import { favorites } from '$lib/stores/favorites.svelte';
	import { BodyLong, Heading } from '@nais/ds-svelte-community';
	import { StarIcon } from '@nais/ds-svelte-community/icons';
	import FavoritesListItem from './FavoritesListItem.svelte';
	import List from './List.svelte';
</script>

<div class="favorites-list">
	<div class="header">
		<Heading level="1" size="large">My Favorites</Heading>
	</div>

	<List>
		{#each favorites.getFavorites() as fav (fav)}
			<FavoritesListItem path={fav} />
		{:else}
			<BodyLong>
				Click the <StarIcon /> icon on any page to add it to your favorites. You haven’t added any yet.
			</BodyLong>
		{/each}
	</List>
</div>

<style>
	.favorites-list {
		margin-top: var(--ax-space-16);
	}
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--ax-space-16);
	}
</style>
