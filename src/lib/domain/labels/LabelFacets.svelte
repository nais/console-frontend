<script lang="ts">
	interface LabelFacet {
		key: string;
		value: string;
		count: number;
	}

	interface Props {
		labels: LabelFacet[];
		selectedLabels: string[];
		onLabelsChange: (selected: string[]) => void;
	}

	let { labels, selectedLabels, onLabelsChange }: Props = $props();

	function labelId(label: LabelFacet): string {
		return `${label.key}:${label.value}`;
	}

	const availableLabels = $derived(new Set(labels.map((f) => labelId(f))));

	function toggleLabel(label: LabelFacet) {
		const id = labelId(label);
		const isSelected = selectedLabels.includes(id);
		const next = isSelected
			? selectedLabels.filter((l) => l !== id && availableLabels.has(l))
			: [...selectedLabels.filter((l) => availableLabels.has(l)), id];
		onLabelsChange(next);
	}
</script>

<details class="filter-section" open>
	<summary class="section-heading">Labels</summary>
	<div class="facet-list">
		{#each labels as facet (labelId(facet))}
			{@const display = `${facet.key.replace(/^labels\.nais\.io\//, '')}=${facet.value}`}
			<label class="facet-item">
				<input
					type="checkbox"
					checked={selectedLabels.includes(labelId(facet))}
					onchange={() => toggleLabel(facet)}
				/>
				<span title={display} class="facet-label">{display}</span>
				<span class="facet-count">{facet.count}</span>
			</label>
		{/each}
	</div>
</details>
