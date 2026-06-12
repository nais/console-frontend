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

	interface LabelFacet {
		key: string;
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
		labels?: LabelFacet[];
		selectedStates?: string[];
		selectedEnvironments?: string[];
		selectedLabels?: string[];
		onFilterInput?: (value: string) => void;
		onFilterSubmit?: () => void;
		onFilterClear?: () => void;
		onSort: (field: string) => void;
		onStatesChange?: (selected: string[]) => void;
		onEnvironmentsChange?: (selected: string[]) => void;
		onLabelsChange?: (selected: string[]) => void;
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
		labels = [],
		selectedStates = [],
		selectedEnvironments = [],
		selectedLabels = [],
		onFilterInput,
		onFilterSubmit,
		onFilterClear,
		onSort,
		onStatesChange = () => {},
		onEnvironmentsChange = () => {},
		onLabelsChange = () => {},
		children
	}: Props = $props();

	function stateLabel(state: string): string {
		return capitalizeFirstLetter(state.split('_').join(' ').toLowerCase());
	}

	function labelId(label: LabelFacet): string {
		return `${label.key}:${label.value}`;
	}

	const displayStates = $derived([
		...states,
		...selectedStates
			.filter((s) => !states.some((f) => f.state === s))
			.map((s) => ({ state: s, count: 0 }))
	]);
	const displayEnvironments = $derived([
		...environments,
		...selectedEnvironments
			.filter((e) => !environments.some((f) => f.value === e))
			.map((e) => ({ value: e, count: 0 }))
	]);

	const availableLabels = $derived(new Set(labels.map((f) => labelId(f))));

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

	function toggleLabel(label: LabelFacet) {
		const id = labelId(label);
		const isSelected = selectedLabels.includes(id);
		const next = isSelected
			? selectedLabels.filter((l) => l !== id && availableLabels.has(l))
			: [...selectedLabels.filter((l) => availableLabels.has(l)), id];
		onLabelsChange(next);
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
	{#if displayStates.length > 0}
		<details class="filter-section" open>
			<summary class="section-heading">Status</summary>
			<div class="facet-list">
				{#each displayStates as facet (facet.state)}
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

	{#if displayEnvironments.length > 0}
		<details class="filter-section" open>
			<summary class="section-heading">Environments</summary>
			<div class="facet-list">
				{#each displayEnvironments as facet (facet.value)}
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

	{#if labels.length > 0}
		<details class="filter-section" open>
			<summary class="section-heading">Labels</summary>
			<div class="facet-list">
				{#each labels as facet (labelId(facet))}
					{@const display = `${facet.key}=${facet.value}`}
					<label class="facet-item">
						<input
							type="checkbox"
							checked={selectedLabels.includes(labelId(facet))}
							onchange={() => toggleLabel(facet)}
						/>
						<span title={display} class="facet-label"
							>{display.replace(/^labels\.nais\.io\//, '')}</span
						>
						<span class="facet-count">{facet.count}</span>
					</label>
				{/each}
			</div>
		</details>
	{/if}

	{@render children?.()}
</ListFilters>
