<script lang="ts">
	import PageHeader from '$lib/ui/PageHeader.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { LayoutProps } from './$types';
	import Menu from './Menu.svelte';
	import MenuTrigger from './MenuTrigger.svelte';
	import { createTeamContext } from './teamContext.svelte';

	let { data, children }: LayoutProps = $props();
	let { deletionInProgress, lastSuccessfulSync, teamSlug, UserInfo, viewerIsMember } =
		$derived(data);

	createTeamContext();

	const isAdmin = $derived(
		$UserInfo.data?.me.__typename === 'User' ? $UserInfo.data?.me.isAdmin : false
	);
</script>

<div class="page">
	{#if deletionInProgress}
		<Alert variant="warning" style="margin-bottom: 1rem;"
			>The team and all of its resources is currently being deleted.</Alert
		>
	{/if}
	{#if !lastSuccessfulSync && !deletionInProgress}
		<Alert variant="info" style="margin-bottom: 1rem;" contentMaxWidth={false}
			>The team and all of its resources is currently being created. Expected time to completion is
			about 15 minutes.</Alert
		>
	{/if}

	<div class="main">
		<Menu features={$UserInfo.data?.features} member={viewerIsMember} {teamSlug} {isAdmin} />
		<div class="container">
			<PageHeader>
				{#snippet beforeBreadcrumbs()}
					<MenuTrigger />
				{/snippet}
			</PageHeader>
			<div>{@render children?.()}</div>
		</div>
	</div>
</div>

<style>
	.page {
		margin-top: var(--spacing-layout);
		width: 100%;
	}

	.main {
		gap: var(--spacing-layout);
		display: grid;
		grid-template-columns: 202px 1fr;
	}

	@media (max-width: 768px), (max-height: 500px) {
		.main {
			grid-template-columns: 1fr;
		}
	}

	.container {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		min-width: 0;
	}

	.container > div {
		min-width: 0;
	}
</style>
