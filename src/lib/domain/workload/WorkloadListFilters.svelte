<script lang="ts">
	import ListFilters from '$lib/ui/ListFilters.svelte';
	import { capitalizeFirstLetter } from '$lib/utils/formatters';
	import type { Snippet } from 'svelte';

	interface StateFacet {
		state: string;
		count: number;
	}

	interface EnvironmentFacet {
		value: string;
		count: number;
	}

	interface SortField {
		value: string;
		label: string;
	}

	interface Props {
		filter?: string;
		searchPlaceholder?: string;
		searchLabel?: string;
		sortFields: SortField[];
		currentSortField: string;
		currentSortDirection: string;
		states?: StateFacet[];
		environments?: EnvironmentFacet[];
		selectedStates?: string[];
		selectedEnvironments?: string[];
		onFilterInput?: (value: string) => void;
		onFilterSubmit?: () => void;
		onFilterClear?: () => void;
		onSort: (field: string) => void;
		onStatesChange?: (selected: string[]) => void;
		onEnvironmentsChange?: (selected: string[]) => void;
		children?: Snippet;
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
		selectedStates = [],
		selectedEnvironments = [],
		onFilterInput,
		onFilterSubmit,
		onFilterClear,
		onSort,
		onStatesChange = () => {},
		onEnvironmentsChange = () => {},
		children
	}: Props = $props();

	function stateLabel(state: string): string {
		return capitalizeFirstLetter(state.split('_').join(' ').toLowerCase());
	}

	function toggleState(state: string) {
		const isSelected = selectedStates.includes(state);
		const next = isSelected
			? selectedStates.filter((s) => s !== state)
			: [...selectedStates, state];
		onStatesChange(next);
	}

	function toggleEnvironment(env: string) {
		const isSelected = selectedEnvironments.includes(env);
		const next = isSelected
			? selectedEnvironments.filter((e) => e !== env)
			: [...selectedEnvironments, env];
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
		<details class="filter-section" open>
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
		<details class="filter-section" open>
			<summary class="section-heading">Environments</summary>
			<div class="facet-list">
				{#each environments as facet (facet.value)}
					<label class="facet-item">
						<input
							type="checkbox"
							checked={selectedEnvironments.includes(facet.value)}
							onchange={() => toggleEnvironment(facet.value)}
						/>
						<span class="facet-label">{facet.value}</span>
						<span class="facet-count">{facet.count}</span>
					</label>
				{/each}
			</div>
		</details>
	{/if}

	{@render children?.()}
</ListFilters>

<style>
</style>
