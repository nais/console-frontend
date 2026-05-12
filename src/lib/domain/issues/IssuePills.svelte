<script lang="ts">
	import { Tag } from '@nais/ds-svelte-community';

	interface Props {
		critical?: number;
		warning?: number;
		todo?: number;
		direction?: 'row' | 'column';
	}

	let { critical = 0, warning = 0, todo = 0, direction = 'row' }: Props = $props();

	let hasIssues = $derived(critical > 0 || warning > 0 || todo > 0);
</script>

<div class="pills" class:column={direction === 'column'}>
	{#if hasIssues}
		{#if critical > 0}
			<Tag size="xsmall" variant="error-moderate">{critical} critical</Tag>
		{/if}
		{#if warning > 0}
			<Tag size="xsmall" variant="warning-moderate">{warning} warning</Tag>
		{/if}
		{#if todo > 0}
			<Tag size="xsmall" variant="info-moderate">{todo} todo</Tag>
		{/if}
	{:else}
		<span class="no-issues">No issues</span>
	{/if}
</div>

<style>
	.pills {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ax-space-4);
	}

	.pills.column {
		flex-direction: column;
		align-items: flex-end;
	}

	.no-issues {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-success);
	}
</style>
