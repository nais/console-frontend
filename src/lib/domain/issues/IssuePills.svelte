<script lang="ts">
	import Pill from '$lib/ui/Pill.svelte';

	interface Props {
		critical?: number;
		warning?: number;
		todo?: number;
		direction?: 'row' | 'column';
	}

	let { critical = 0, warning = 0, todo = 0, direction = 'row' }: Props = $props();
</script>

<div class="pills" class:column={direction === 'column'}>
	{#if critical > 0}
		<Pill variant="critical">{critical} critical</Pill>
	{/if}
	{#if warning > 0}
		<Pill variant="warning">{warning} warning</Pill>
	{/if}
	{#if todo > 0}
		<Pill variant="todo">{todo} todo</Pill>
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
</style>
