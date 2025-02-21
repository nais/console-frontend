<script lang="ts">
	import { Alert } from '@nais/ds-svelte-community';
	import type { LayoutData } from './$houdini';

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
	let { deletionInProgress, lastSuccessfulSync, teamSlug } = $derived(data);
</script>

<svelte:head><title>{teamSlug} - Console</title></svelte:head>

<div class="page">
	{#if deletionInProgress}
		<Alert variant="warning" style="margin-bottom: 1rem;"
			>The team and all of its resources is currently being deleted.</Alert
		>
	{/if}
	{#if !lastSuccessfulSync && !deletionInProgress}
		<Alert variant="success" style="margin-bottom: 1rem;" contentMaxWidth={false}
			>The team and all of its resources is currently beeing created. Expected time to completion is
			about 15 minutes.</Alert
		>
	{/if}

	{@render children?.()}
</div>

<style>
	.page {
		margin-top: 1rem;
		width: 100%;
	}
</style>
