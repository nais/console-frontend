<script lang="ts">
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { Button } from '@nais/ds-svelte-community';
	import { NotePencilIcon } from '@nais/ds-svelte-community/icons';

	interface Label {
		key: string;
		value: string;
	}

	interface Props {
		labels: readonly Label[];
		onEdit?: () => void;
	}

	let { labels, onEdit }: Props = $props();
</script>

{#if labels.length > 0 || onEdit}
	<SurfaceCard title="Labels">
		{#snippet headerAside()}
			{#if onEdit}
				<Button
					size="small"
					variant="tertiary-neutral"
					icon={NotePencilIcon}
					title="Edit labels"
					type="button"
					onclick={onEdit}
				/>
			{/if}
		{/snippet}
		{#if labels.length > 0}
			<div class="labels">
				{#each labels as label (label.key)}
					<span class="label" title="{label.key}={label.value}">{label.key}={label.value}</span>
				{/each}
			</div>
		{:else}
			<p class="empty">No labels yet</p>
		{/if}
	</SurfaceCard>
{/if}

<style>
	.labels {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
		min-width: 0;
	}

	.label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
	}

	.empty {
		margin: 0;
		font-size: var(--ax-font-size-small);
	}
</style>
