<script lang="ts">
	import { IssueType, Severity } from '$houdini';
	import { issueTypeLabel } from '$lib/utils/issueTypeLabel';
	import {
		ActionMenuRadioGroup,
		ActionMenuRadioItem
	} from '@nais/ds-svelte-community/experimental';

	interface Props {
		severity?: string;
		issueType?: string;
		onSeverityChange: (severity: string) => void;
		onIssueTypeChange: (issueType: string) => void;
	}

	let { severity = '', issueType = '', onSeverityChange, onIssueTypeChange }: Props = $props();
</script>

<ActionMenuRadioGroup value={severity} label="Severity">
	<ActionMenuRadioItem value="" onselect={() => onSeverityChange('')}
		>All severities</ActionMenuRadioItem
	>

	{#each Object.values(Severity) as severityOption (severityOption)}
		<ActionMenuRadioItem
			value={severityOption}
			onselect={() => onSeverityChange(String(severityOption))}
		>
			{severityOption.charAt(0) + severityOption.slice(1).toLowerCase()}
		</ActionMenuRadioItem>
	{/each}
</ActionMenuRadioGroup>

<ActionMenuRadioGroup value={issueType} label="Issue type">
	<ActionMenuRadioItem value="" onselect={() => onIssueTypeChange('')}
		>All issue types</ActionMenuRadioItem
	>
	{#each Object.values(IssueType) as issueTypeOption (issueTypeOption)}
		<ActionMenuRadioItem
			value={issueTypeOption}
			onselect={() => onIssueTypeChange(String(issueTypeOption))}
		>
			{issueTypeLabel(issueTypeOption)}
		</ActionMenuRadioItem>
	{/each}
</ActionMenuRadioGroup>
