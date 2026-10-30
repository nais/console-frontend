<script lang="ts">
	import { Badge } from '#lib/shadcn/ui/index.js';

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
			<Badge size="sm" variant="destructive" dot>{critical} critical</Badge>
		{/if}
		{#if warning > 0}
			<Badge size="sm" variant="warning" dot>{warning} warning</Badge>
		{/if}
		{#if todo > 0}
			<Badge size="sm" variant="info" dot>{todo} todo</Badge>
		{/if}
	{:else}
		<Badge size="sm" variant="success" dot>No issues</Badge>
	{/if}
</div>

<style>
	.pills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.pills.column {
		flex-direction: column;
		align-items: flex-end;
	}
</style>
