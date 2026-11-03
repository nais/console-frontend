<script lang="ts">
	import { ShButton, Tooltip } from '#lib/shadcn/ui/index.js';
	import { favorites } from '#lib/stores/favorites.svelte.js';

	import { StarIcon } from '#lib/icons/index.js';

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
	<ShButton
		variant="ghost"
		size="icon-sm"
		onclick={toggleFavorite}
		ariaLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
	>
		{#snippet icon()}
			<StarIcon fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
		{/snippet}
	</ShButton>
</Tooltip>
