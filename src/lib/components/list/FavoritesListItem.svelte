<script lang="ts">
	import { favorites } from '$lib/stores/favorites.svelte';
	import { pathToFavoriteLabel } from '$lib/urlToPageHeader';
	import { Button, Tooltip } from '@nais/ds-svelte-community';
	import { DragVerticalIcon, StarFillIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import IconLabel from '../IconLabel.svelte';
	import ListItem from './ListItem.svelte';

	const {
		path
	}: {
		path: string;
	} = $props();

	function removeFavorite() {
		favorites.removeFavorite(path);
	}
</script>

<ListItem>
	<IconLabel label={pathToFavoriteLabel(path)} icon={StarFillIcon} size="medium" href={path} />
	<div class="right">
		<Tooltip placement="bottom" content="Remove from favorites">
			<Button icon={TrashIcon} onclick={removeFavorite} variant="tertiary-neutral" />
		</Tooltip>
	</div>
	<div class="drag-handle" aria-label="Drag to reorder" title="Drag to reorder">
		<DragVerticalIcon />
	</div>
</ListItem>

<style>
	.right {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: var(--ax-space-1);
	}

	.drag-handle {
		cursor: grab;
		user-select: none;
		margin-right: var(--ax-space-2);
		display: flex;
		align-items: center;
		font-size: 1.2rem;
	}
</style>
