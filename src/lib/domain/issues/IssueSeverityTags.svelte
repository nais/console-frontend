<script lang="ts">
	import { Tag } from '@nais/ds-svelte-community';

	interface Props {
		critical?: number;
		warning?: number;
		todo?: number;
		layout?: 'inline' | 'stacked';
	}

	let { critical = 0, warning = 0, todo = 0, layout = 'inline' }: Props = $props();
</script>

<div
	class="issues-container"
	class:inline={layout === 'inline'}
	class:stacked={layout === 'stacked'}
>
	{#if critical > 0}
		<Tag variant="error" size="xsmall">{critical} critical issue{critical > 1 ? 's' : ''}</Tag>
	{/if}
	{#if warning > 0}
		<Tag variant="warning" size="xsmall">{warning} warning{warning > 1 ? 's' : ''}</Tag>
	{/if}
	{#if todo > 0}
		<Tag variant="info" size="xsmall">{todo} todo{todo > 1 ? 's' : ''}</Tag>
	{/if}
</div>

<style>
	.issues-container {
		display: flex;
		gap: var(--ax-space-16);
		width: 100%;
	}

	.inline {
		flex-wrap: wrap;
		align-items: center;
	}

	.stacked {
		flex-direction: column;
		align-items: flex-end;
	}
</style>
