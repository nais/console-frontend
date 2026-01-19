<script lang="ts">
	import PageHeader from '$lib/ui/PageHeader.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { LayoutProps } from './$types';
	import Menu from './Menu.svelte';
	import { createTeamContext } from './teamContext.svelte';

	let { data, children }: LayoutProps = $props();
	let { deletionInProgress, lastSuccessfulSync, teamSlug, UserInfo, userIsMember, userCanElevate } =
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
		<Menu
			features={$UserInfo.data?.features}
			member={userIsMember}
			canModify={userCanElevate}
			{teamSlug}
			{isAdmin}
		/>
		<div class="container">
			<PageHeader />
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

	.container {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
</style>
