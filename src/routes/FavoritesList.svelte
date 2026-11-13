<script lang="ts">
	import FavoritesListItem from '#lib/domain/list-items/FavoritesListItem.svelte';
	import { Badge, Heading } from '#lib/shadcn/ui/index.js';
	import { favorites } from '#lib/stores/favorites.svelte.js';
	import SortableList from '#lib/ui/SortableList.svelte';
	import { StarIcon } from '#lib/icons/index.js';

	let favItems = $derived(favorites.getFavorites().filter(Boolean));
	const uid = $props.id();
</script>

<section aria-labelledby="{uid}-heading" class="favorites">
	<div class="favorites-header">
		<div class="favorites-title">
			<StarIcon aria-hidden="true" />
			<Heading as="h2" size="medium" id="{uid}-heading">Pinned Favorites</Heading>
			{#if favItems.length}<Badge variant="secondary">{favItems.length}</Badge>{/if}
		</div>
	</div>
	{#if favItems.length}
		<div class="favorites-card">
			<SortableList
				items={favorites.getFavorites()}
				onReorder={(newOrder) => favorites.setFavorites(newOrder)}
			>
				{#each favItems as fav (fav)}<FavoritesListItem path={fav} />{/each}
			</SortableList>
		</div>
	{:else}
		<p class="favorites-empty">
			No pinned favorites yet. Click the star icon in any page header to pin workloads, databases,
			or teams here.
		</p>
	{/if}
</section>

<style>
	.favorites {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-12);
	}
	.favorites-card {
		background: var(--card);
		border: var(--sh-border-width) solid var(--border);
		border-radius: var(--radius);
		box-shadow: var(--sh-shadow-xs);
		overflow: hidden;
	}
	.favorites-header {
		display: flex;
		align-items: center;
		min-height: var(--nais-space-28);
	}
	.favorites-title {
		display: flex;
		align-items: center;
		gap: var(--nais-space-8);
		flex-wrap: wrap;
	}
	.favorites-title :global(svg) {
		color: var(--foreground);
	}
	.favorites-empty {
		margin: 0;
		color: var(--foreground);
		font-size: var(--sh-font-size-sm);
	}
</style>
