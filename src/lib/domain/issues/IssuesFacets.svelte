<script lang="ts">
	import { capitalizeFirstLetter } from '$lib/utils/formatters';
	import { issueTypeLabel } from '$lib/utils/issueTypeLabel';

	interface SeverityFacet {
		severity: string;
		count: number;
	}

	interface IssueTypeFacet {
		issueType: string;
		count: number;
	}

	interface EnvironmentFacet {
		value: string;
		count: number;
	}

	interface Props {
		severities: SeverityFacet[];
		issueTypes: IssueTypeFacet[];
		environments: EnvironmentFacet[];
		selectedSeverity: string;
		selectedIssueType: string;
		selectedEnvironments: string[];
		onSeverityChange: (severity: string) => void;
		onIssueTypeChange: (issueType: string) => void;
		onEnvironmentsChange: (selected: string[]) => void;
	}

	let {
		severities,
		issueTypes,
		environments,
		selectedSeverity,
		selectedIssueType,
		selectedEnvironments,
		onSeverityChange,
		onIssueTypeChange,
		onEnvironmentsChange
	}: Props = $props();

	function severityLabel(severity: string): string {
		return capitalizeFirstLetter(severity.toLowerCase());
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
	{#if severities.length > 0}
		<details class="facet-section" open>
			<summary class="facet-heading">Severity</summary>
			<div class="facet-list">
				<label class="facet-item">
					<input
						type="radio"
						name="severity"
						checked={selectedSeverity === ''}
						onchange={() => onSeverityChange('')}
					/>
					<span class="facet-label">All</span>
				</label>
				{#each severities as facet (facet.severity)}
					<label class="facet-item">
						<input
							type="radio"
							name="severity"
							checked={selectedSeverity === facet.severity}
							onchange={() => onSeverityChange(facet.severity)}
						/>
						<span class="facet-label">{severityLabel(facet.severity)}</span>
						<span class="facet-count">{facet.count}</span>
					</label>
				{/each}
			</div>
		</details>
	{/if}

	{#if issueTypes.length > 0}
		<details class="facet-section" open>
			<summary class="facet-heading">Issue Type</summary>
			<div class="facet-list">
				<label class="facet-item">
					<input
						type="radio"
						name="issueType"
						checked={selectedIssueType === ''}
						onchange={() => onIssueTypeChange('')}
					/>
					<span class="facet-label">All</span>
				</label>
				{#each issueTypes as facet (facet.issueType)}
					<label class="facet-item">
						<input
							type="radio"
							name="issueType"
							checked={selectedIssueType === facet.issueType}
							onchange={() => onIssueTypeChange(facet.issueType)}
						/>
						<span class="facet-label">{issueTypeLabel(facet.issueType)}</span>
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

	.facet-item input[type='checkbox'],
	.facet-item input[type='radio'] {
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
