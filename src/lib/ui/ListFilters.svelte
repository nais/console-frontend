<script module lang="ts">
	let persistedSortOpen = false;
</script>

<script lang="ts">
	import SearchField from '$lib/ui/SearchField.svelte';
	import { SortDownIcon, SortUpIcon } from '@nais/ds-svelte-community/icons';
	import type { Snippet } from 'svelte';

	interface SortField {
		value: string;
		label: string;
	}

	interface Props {
		filter?: string;
		searchPlaceholder?: string;
		searchLabel?: string;
		sortFields?: SortField[];
		currentSortField?: string;
		currentSortDirection?: string;
		onFilterInput?: (value: string) => void;
		onFilterSubmit?: () => void;
		onFilterClear?: () => void;
		onSort?: (field: string) => void;
		children?: Snippet;
	}

	let {
		filter,
		searchPlaceholder,
		searchLabel,
		sortFields,
		currentSortField,
		currentSortDirection,
		onFilterInput,
		onFilterSubmit,
		onFilterClear,
		onSort,
		children
	}: Props = $props();

	let sortOpen = $state(persistedSortOpen);

	$effect(() => {
		persistedSortOpen = sortOpen;
	});
</script>

<div class="filters">
	{#if filter !== undefined && onFilterInput && onFilterSubmit && onFilterClear}
		<div class="filter-section">
			<SearchField
				value={filter}
				placeholder={searchPlaceholder ?? 'Search...'}
				label={searchLabel ?? 'Search'}
				oninput={onFilterInput}
				onsubmit={onFilterSubmit}
				onclear={onFilterClear}
			/>
		</div>
	{/if}

	{#if sortFields && sortFields.length > 0 && onSort}
		<details class="filter-section" bind:open={sortOpen}>
			<summary class="section-heading">Sort By</summary>
			<div class="sort-options">
				{#each sortFields as { value, label } (value)}
					{@const isActive = currentSortField === value}
					<button
						type="button"
						class="sort-option"
						class:active={isActive}
						onclick={() => onSort(value)}
					>
						<span class="sort-option-label">{label}</span>
						{#if isActive}
							<span class="sort-direction">
								{#if currentSortDirection === 'ASC'}
									<SortUpIcon />
								{:else}
									<SortDownIcon />
								{/if}
							</span>
						{/if}
					</button>
				{/each}
			</div>
		</details>
	{/if}

	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	.filters {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}

	.filter-section {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}

	.section-heading {
		font-size: var(--ax-font-size-small);
		font-weight: 500;
		color: var(--ax-text-neutral-subtle);
		margin: 0;
		letter-spacing: 0.01em;
		border-bottom: 1px solid var(--ax-border-neutral-subtleA);
		padding-bottom: var(--ax-space-6);
		cursor: pointer;
		list-style: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.section-heading::-webkit-details-marker {
		display: none;
	}

	.section-heading::after {
		content: '';
		width: 0.4em;
		height: 0.4em;
		border-right: 2px solid currentColor;
		border-bottom: 2px solid currentColor;
		transform: rotate(45deg);
		transition: transform 150ms ease;
		flex-shrink: 0;
	}

	.filter-section[open] > .section-heading::after {
		transform: rotate(-135deg);
	}

	.sort-options {
		display: flex;
		flex-direction: column;
	}

	.sort-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-8);
		padding: var(--ax-space-6) var(--ax-space-8);
		border: none;
		border-radius: var(--ax-radius-8);
		background: transparent;
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
		cursor: pointer;
		text-align: left;
		transition: background-color 120ms ease;
	}

	.sort-option:hover {
		background: var(--ax-bg-neutral-moderate);
	}

	.sort-option.active {
		font-weight: 600;
		color: var(--ax-text-accent);
	}

	.sort-direction {
		font-size: var(--ax-font-size-small);
		font-weight: 600;
	}
</style>
