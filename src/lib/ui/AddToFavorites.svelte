<script lang="ts">
	import { favorites } from '$lib/stores/favorites.svelte';
	import { Button, Tooltip } from '@nais/ds-svelte-community';
	import { StarFillIcon, StarIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		path: string;
	}

	let { path }: Props = $props();

	function toggleFavorite() {
		if (favorites.isFavorite(path)) {
			favorites.removeFavorite(path);
		} else {
			favorites.addFavorite(path);
		}
	}

	const isFavorite = $derived(favorites.isFavorite(path));
</script>

<Tooltip placement="bottom" content={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
	<Button
		variant="tertiary-neutral"
		onclick={toggleFavorite}
		icon={isFavorite ? StarFillIcon : StarIcon}
	/>
</Tooltip>
