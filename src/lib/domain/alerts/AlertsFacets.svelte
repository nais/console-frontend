<script lang="ts">
	import { capitalizeFirstLetter } from '$lib/utils/formatters';

	interface EnvironmentEntry {
		id: string;
		environment: {
			name: string;
		};
	}

	interface Props {
		environments: EnvironmentEntry[];
		states: { state: string; count: number }[];
		selectedStates: string[];
		selectedEnvironments: string[];
		onStatesChange: (selected: string[]) => void;
		onEnvironmentsChange: (selected: string[]) => void;
	}

	let {
		environments,
		states,
		selectedStates,
		selectedEnvironments,
		onStatesChange,
		onEnvironmentsChange
	}: Props = $props();

	function stateLabel(state: string): string {
		return capitalizeFirstLetter(state.toLowerCase());
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

<div class="facets">
	{#if states.length > 0}
		<details class="facet-section">
			<summary class="facet-heading">State</summary>
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
		<details class="facet-section">
			<summary class="facet-heading">Environments</summary>
			<div class="facet-list">
				{#each environments as entry (entry.id)}
					<label class="facet-item">
						<input
							type="checkbox"
							checked={selectedEnvironments.includes(entry.environment.name)}
							onchange={() => toggleEnvironment(entry.environment.name)}
						/>
						<span class="facet-label">{entry.environment.name}</span>
					</label>
				{/each}
			</div>
		</details>
	{/if}
</div>

<style>
	.facets {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}

	.facet-section {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}

	.facet-heading {
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

	.facet-heading::-webkit-details-marker {
		display: none;
	}

	.facet-heading::after {
		content: '';
		width: 0.4em;
		height: 0.4em;
		border-right: 2px solid currentColor;
		border-bottom: 2px solid currentColor;
		transform: rotate(45deg);
		transition: transform 150ms ease;
		flex-shrink: 0;
	}

	.facet-section[open] > .facet-heading::after {
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
