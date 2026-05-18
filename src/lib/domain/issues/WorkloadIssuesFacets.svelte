<script lang="ts">
	import { IssueType, Severity } from '$houdini';
	import { issueTypeLabel } from '$lib/utils/issueTypeLabel';

	interface Props {
		selectedSeverity: string;
		selectedIssueType: string;
		onSeverityChange: (severity: string) => void;
		onIssueTypeChange: (issueType: string) => void;
	}

	let { selectedSeverity, selectedIssueType, onSeverityChange, onIssueTypeChange }: Props =
		$props();

	function severityLabel(severity: string): string {
		return severity.charAt(0) + severity.slice(1).toLowerCase();
	}
</script>

<details class="facet-section">
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
		{#each Object.values(Severity) as severity (severity)}
			<label class="facet-item">
				<input
					type="radio"
					name="severity"
					checked={selectedSeverity === severity}
					onchange={() => onSeverityChange(String(severity))}
				/>
				<span class="facet-label">{severityLabel(String(severity))}</span>
			</label>
		{/each}
	</div>
</details>

<details class="facet-section">
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
		{#each Object.values(IssueType) as type (type)}
			<label class="facet-item">
				<input
					type="radio"
					name="issueType"
					checked={selectedIssueType === type}
					onchange={() => onIssueTypeChange(String(type))}
				/>
				<span class="facet-label">{issueTypeLabel(String(type))}</span>
			</label>
		{/each}
	</div>
</details>

<style>
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

	.facet-item input[type='radio'] {
		width: 1rem;
		height: 1rem;
		margin: 0;
		flex-shrink: 0;
		cursor: pointer;
		accent-color: var(--ax-text-accent);
	}
</style>
