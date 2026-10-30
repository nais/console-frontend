<script lang="ts">
	import FavoritesListItem from '#lib/domain/list-items/FavoritesListItem.svelte';
	import { Badge } from '#lib/shadcn/ui/index.js';
	import { favorites } from '#lib/stores/favorites.svelte.js';
	import SortableList from '#lib/ui/SortableList.svelte';
	import { StarIcon } from '#lib/icons/index.js';

	let favItems = $derived(favorites.getFavorites().filter(Boolean));
</script>

<div class="favorites-card">
	<div class="favorites-header">
		<div class="favorites-title-row">
			<div class="favorites-title-left">
				<StarIcon class="star-icon" aria-hidden="true" />
				<h2 class="favorites-heading">Pinned Favorites</h2>
			</div>
			<Badge variant="secondary" mono>{favItems.length}</Badge>
		</div>
		<p class="favorites-sub">Quick links to your starred workloads and resources.</p>
	</div>

	<div class="favorites-body">
		<SortableList
			items={favorites.getFavorites()}
			onReorder={(newOrder) => favorites.setFavorites(newOrder)}
		>
			{#each favItems as fav (fav)}
				<FavoritesListItem path={fav} />
			{:else}
				<div class="favorites-empty">
					<div class="empty-star">
						<StarIcon aria-hidden="true" />
					</div>
					<p class="empty-title">No pinned favorites yet</p>
					<p class="empty-desc">
						Click the star icon in any page header to pin workloads, databases, or teams here.
					</p>
				</div>
			{/each}
		</SortableList>
	</div>
</div>

<style>
	.favorites-card {
		background-color: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		box-shadow: var(--sh-shadow-xs);
		overflow: hidden;
	}

	.favorites-header {
		padding: 0.875rem 1.125rem;
		border-bottom: 1px solid var(--border);
		background-color: var(--card);
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.favorites-title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.favorites-title-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.favorites-title-left :global(.star-icon) {
		color: var(--warning);
		font-size: 1rem;
	}

	.favorites-heading {
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--foreground);
	}

	.favorites-sub {
		margin: 0;
		font-size: 0.75rem;
		color: var(--muted-foreground);
	}

	.favorites-body {
		display: flex;
		flex-direction: column;
	}

	.favorites-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 2rem 1.25rem;
		gap: 0.375rem;
	}

	.empty-star {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: var(--radius-full);
		background-color: var(--warning-muted);
		color: var(--warning);
		margin-bottom: 0.25rem;
	}

	.empty-title {
		margin: 0;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--foreground);
	}

	.empty-desc {
		margin: 0;
		font-size: 0.75rem;
		color: var(--muted-foreground);
		max-width: 240px;
		line-height: 1.45;
	}
</style>
