<script lang="ts">
	import { capitalizeFirstLetter } from '$lib/utils/formatters';
	import { issueTypeLabel } from '$lib/utils/issueTypeLabel';

	interface SeverityFacet {
		severity: string;
		count: number;
	}

	interface EnvironmentEntry {
		id: string;
		environment: {
			name: string;
		};
	}

	interface Props {
		severities: SeverityFacet[];
		issueTypes: string[];
		environments: EnvironmentEntry[];
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
		<div class="facet-section">
			<h4 class="facet-heading">Severity</h4>
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
		</div>
	{/if}

	{#if issueTypes.length > 0}
		<div class="facet-section">
			<h4 class="facet-heading">Issue Type</h4>
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
				{#each issueTypes as type (type)}
					<label class="facet-item">
						<input
							type="radio"
							name="issueType"
							checked={selectedIssueType === type}
							onchange={() => onIssueTypeChange(type)}
						/>
						<span class="facet-label">{issueTypeLabel(type)}</span>
					</label>
				{/each}
			</div>
		</div>
	{/if}

	{#if environments.length > 0}
		<div class="facet-section">
			<h4 class="facet-heading">Environments</h4>
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
		</div>
	{/if}
</div>

<style>
	.facets {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
	}

	.facet-section {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}

	.facet-heading {
		font-size: var(--ax-font-size-small);
		font-weight: 600;
		color: var(--ax-text-neutral-subtle);
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		border-bottom: 1px solid var(--ax-border-neutral-subtleA);
		padding-bottom: var(--ax-space-8);
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
