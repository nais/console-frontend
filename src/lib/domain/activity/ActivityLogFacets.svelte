<script lang="ts">
	import type { ActivityLogActivityType$options } from '$houdini';
	import { capitalizeFirstLetter } from '$lib/utils/formatters';

	interface ActivityTypeFacet {
		activityType: ActivityLogActivityType$options;
		count: number;
	}

	interface ResourceTypeFacet {
		resourceType: string;
		count: number;
	}

	interface EnvironmentFacet {
		value: string;
		count: number;
	}

	interface Props {
		activityTypes: ActivityTypeFacet[];
		resourceTypes?: ResourceTypeFacet[];
		environments?: EnvironmentFacet[];
		selectedActivityTypes: ActivityLogActivityType$options[];
		selectedResourceTypes?: string[];
		selectedEnvironments?: string[];
		onActivityTypesChange: (selected: ActivityLogActivityType$options[]) => void;
		onResourceTypesChange?: (selected: string[]) => void;
		onEnvironmentsChange?: (selected: string[]) => void;
	}

	let {
		activityTypes,
		resourceTypes = [],
		environments = [],
		selectedActivityTypes,
		selectedResourceTypes = [],
		selectedEnvironments = [],
		onActivityTypesChange,
		onResourceTypesChange,
		onEnvironmentsChange
	}: Props = $props();

	function formatLabel(type: string): string {
		return capitalizeFirstLetter(type.split('_').join(' ').toLowerCase());
	}

	// When unchecking, only keep values that are actually visible in the facets.
	// This cleans up URL params that aren't represented in the UI (e.g. linked from
	// a filtered card where some activity types have 0 entries).
	const availableActivityTypes = $derived(new Set(activityTypes.map((f) => f.activityType)));
	const availableResourceTypes = $derived(new Set(resourceTypes.map((f) => f.resourceType)));
	const availableEnvironments = $derived(new Set(environments.map((f) => f.value)));

	function toggleActivityType(type: ActivityLogActivityType$options) {
		const isSelected = selectedActivityTypes.includes(type);
		const next = isSelected
			? selectedActivityTypes.filter((t) => t !== type && availableActivityTypes.has(t))
			: [...selectedActivityTypes.filter((t) => availableActivityTypes.has(t)), type];
		onActivityTypesChange(next);
	}

	function toggleResourceType(type: string) {
		if (!onResourceTypesChange) return;
		const isSelected = selectedResourceTypes.includes(type);
		const next = isSelected
			? selectedResourceTypes.filter((t) => t !== type && availableResourceTypes.has(t))
			: [...selectedResourceTypes.filter((t) => availableResourceTypes.has(t)), type];
		onResourceTypesChange(next);
	}

	function toggleEnvironment(env: string) {
		if (!onEnvironmentsChange) return;
		const isSelected = selectedEnvironments.includes(env);
		const next = isSelected
			? selectedEnvironments.filter((e) => e !== env && availableEnvironments.has(e))
			: [...selectedEnvironments.filter((e) => availableEnvironments.has(e)), env];
		onEnvironmentsChange(next);
	}
</script>

<div class="facets">
	{#if activityTypes.length > 0}
		<details class="facet-section" open>
			<summary class="facet-heading">Activity Types</summary>
			<div class="facet-list">
				{#each activityTypes as facet (facet.activityType)}
					<label class="facet-item">
						<input
							type="checkbox"
							checked={selectedActivityTypes.includes(facet.activityType)}
							onchange={() => toggleActivityType(facet.activityType)}
						/>
						<span class="facet-label">{formatLabel(facet.activityType)}</span>
						<span class="facet-count">{facet.count}</span>
					</label>
				{/each}
			</div>
		</details>
	{/if}

	{#if resourceTypes.length > 0}
		<details class="facet-section" open>
			<summary class="facet-heading">Resource Types</summary>
			<div class="facet-list">
				{#each resourceTypes as facet (facet.resourceType)}
					<label class="facet-item">
						<input
							type="checkbox"
							checked={selectedResourceTypes.includes(facet.resourceType)}
							onchange={() => toggleResourceType(facet.resourceType)}
						/>
						<span class="facet-label">{formatLabel(facet.resourceType)}</span>
						<span class="facet-count">{facet.count}</span>
					</label>
				{/each}
			</div>
		</details>
	{/if}

	{#if environments.length > 0}
		<details class="facet-section" open>
			<summary class="facet-heading">Environments</summary>
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
		letter-spacing: 0.03em;
		border-bottom: 1px solid var(--ax-border-neutral-subtleA);
		padding-bottom: var(--ax-space-8);
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
