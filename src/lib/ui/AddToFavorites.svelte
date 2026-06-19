<script lang="ts">
	import { favorites } from '$lib/stores/favorites.svelte';
	import { trackEvent } from '$lib/tracking';
	import { Button, Tooltip } from '@nais/ds-svelte-community';
	import { StarFillIcon, StarIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		path: string;
	}

	let { path }: Props = $props();

	function toggleFavorite() {
		if (favorites.isFavorite(path)) {
			favorites.removeFavorite(path);
			trackEvent('favorite-remove');
		} else {
			favorites.addFavorite(path);
			trackEvent('favorite-add');
		}
	}

	const isFavorite = $derived(favorites.isFavorite(path));
</script>

<Tooltip placement="bottom" content={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
	<Button
		variant="tertiary-neutral"
		onclick={toggleFavorite}
		icon={isFavorite ? StarFillIcon : StarIcon}
		aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
	/>
</Tooltip>
