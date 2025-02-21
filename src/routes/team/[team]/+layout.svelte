<script lang="ts">
	import PageHeader from '$lib/components/UrlBasedPageHeader.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$houdini';
	import Menu from './Menu.svelte';

	interface Props {
		data: LayoutData;
		children?: Snippet;
	}

	let { data, children }: Props = $props();
	let { deletionInProgress, lastSuccessfulSync, teamSlug, UserInfo } = $derived(data);
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

	<div class="main">
		<Menu features={UserInfo.data?.features} member={data.viewerIsMember} {teamSlug} />
		<div class="container">
			<PageHeader />
			<div>{@render children?.()}</div>
		</div>
	</div>
</div>

<style>
	.page {
		margin-top: 1rem;
		width: 100%;
	}

	.main {
		gap: 1rem;
		display: grid;
		grid-template-columns: 200px 1fr;
	}

	.container {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-12);
	}
</style>
