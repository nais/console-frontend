<script lang="ts">
	import ListFilters from '$lib/ui/ListFilters.svelte';
	import { capitalizeFirstLetter } from '$lib/utils/formatters';

	interface StateFacet {
		state: string;
		count: number;
	}

	interface EnvironmentFacet {
		environmentName: string;
		count: number;
	}

	interface SortField {
		value: string;
		label: string;
	}

	interface Props {
		filter: string;
		searchPlaceholder: string;
		searchLabel: string;
		sortFields: SortField[];
		currentSortField: string;
		currentSortDirection: string;
		states?: StateFacet[];
		environments?: EnvironmentFacet[];
		selectedStates: string[];
		selectedEnvironments: string[];
		onFilterInput: (value: string) => void;
		onFilterSubmit: () => void;
		onFilterClear: () => void;
		onSort: (field: string) => void;
		onStatesChange: (selected: string[]) => void;
		onEnvironmentsChange: (selected: string[]) => void;
	}

	let {
		filter,
		searchPlaceholder,
		searchLabel,
		sortFields,
		currentSortField,
		currentSortDirection,
		states = [],
		environments = [],
		selectedStates,
		selectedEnvironments,
		onFilterInput,
		onFilterSubmit,
		onFilterClear,
		onSort,
		onStatesChange,
		onEnvironmentsChange
	}: Props = $props();

	function stateLabel(state: string): string {
		return capitalizeFirstLetter(state.split('_').join(' ').toLowerCase());
	}

	const availableStates = $derived(new Set(states.map((f) => f.state)));
	const availableEnvironments = $derived(new Set(environments.map((f) => f.environmentName)));

	function toggleState(state: string) {
		const isSelected = selectedStates.includes(state);
		const next = isSelected
			? selectedStates.filter((s) => s !== state && availableStates.has(s))
			: [...selectedStates.filter((s) => availableStates.has(s)), state];
		onStatesChange(next);
	}

	function toggleEnvironment(env: string) {
		const isSelected = selectedEnvironments.includes(env);
		const next = isSelected
			? selectedEnvironments.filter((e) => e !== env && availableEnvironments.has(e))
			: [...selectedEnvironments.filter((e) => availableEnvironments.has(e)), env];
		onEnvironmentsChange(next);
	}
</script>

<ListFilters
	{filter}
	{searchPlaceholder}
	{searchLabel}
	{sortFields}
	{currentSortField}
	{currentSortDirection}
	{onFilterInput}
	{onFilterSubmit}
	{onFilterClear}
	{onSort}
>
	{#if states.length > 0}
		<details class="filter-section">
			<summary class="section-heading">Status</summary>
			<div class="facet-list">
				{#each states as facet (facet.state)}
					<label class="facet-item">
						<input
							type="checkbox"
							checked={selectedStates.includes(facet.state)}
							onchange={() => toggleState(facet.state)}
						/>
						<span class="facet-label">{stateLabel(facet.state)}</span>
						<span class="facet-count">{facet.count}</span>
					</label>
				{/each}
			</div>
		</details>
	{/if}

	{#if environments.length > 0}
		<details class="filter-section">
			<summary class="section-heading">Environments</summary>
			<div class="facet-list">
				{#each environments as facet (facet.environmentName)}
					<label class="facet-item">
						<input
							type="checkbox"
							checked={selectedEnvironments.includes(facet.environmentName)}
							onchange={() => toggleEnvironment(facet.environmentName)}
						/>
						<span class="facet-label">{facet.environmentName}</span>
						<span class="facet-count">{facet.count}</span>
					</label>
				{/each}
			</div>
		</details>
	{/if}
</ListFilters>

<style>
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

	.facet-list {
		display: flex;
		flex-direction: column;
	}

	.facet-item {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		padding: var(--ax-space-6) 0;
		font-size: var(--ax-font-size-small);
		cursor: pointer;
	}

	.facet-item:hover {
		color: var(--ax-text-neutral);
	}

	.facet-item input[type='checkbox'] {
		width: 1rem;
		height: 1rem;
		margin: 0;
		flex-shrink: 0;
		cursor: pointer;
		accent-color: var(--ax-text-accent);
	}

	.facet-label {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
	}

	.facet-count {
		flex-shrink: 0;
		font-size: 0.6875rem;
		color: var(--ax-text-neutral-subtle);
	}
</style>
