<script lang="ts">
	import { Tag } from '@nais/ds-svelte-community';

	interface Props {
		critical?: number;
		warning?: number;
		todo?: number;
	}

	let { critical = 0, warning = 0, todo = 0 }: Props = $props();
</script>

{#if critical > 0}
	<Tag variant="error" size="xsmall">{critical} critical issue{critical > 1 ? 's' : ''}</Tag>
{/if}
{#if warning > 0}
	<Tag variant="warning" size="xsmall">{warning} warning{warning > 1 ? 's' : ''}</Tag>
{/if}
{#if todo > 0}
	<Tag variant="info" size="xsmall">{todo} todo{todo > 1 ? 's' : ''}</Tag>
{/if}
