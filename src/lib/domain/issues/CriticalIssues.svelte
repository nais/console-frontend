<script lang="ts">
	import type { TeamHealthStore } from '$houdini';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { Button } from '@nais/ds-svelte-community';
	import CriticalIssueRow from './CriticalIssueRow.svelte';

	interface Props {
		teamSlug: string;
		store: TeamHealthStore;
	}

	let { teamSlug, store }: Props = $props();

	const hasCriticalIssues = $derived(($store.data?.team?.issues?.pageInfo?.totalCount ?? 0) > 0);
	const totalCount = $derived($store.data?.team?.issues?.pageInfo?.totalCount ?? 0);

	async function loadMore() {
		await store.loadNextPage({ first: 5 });
	}
</script>

{#if $store.data && hasCriticalIssues}
	<SurfaceCard title="Critical issues ({totalCount})" bordered>
		{#snippet headerAside()}
			<a class="view-all" href="/team/{teamSlug}/issues">View all</a>
		{/snippet}
		<div class="issues-list">
			{#each $store.data?.team?.issues?.edges ?? [] as issue (issue.node.id)}
				<CriticalIssueRow issue={issue.node} />
			{/each}
		</div>

		{#if $store.data?.team?.issues?.pageInfo?.hasNextPage}
			<div class="load-more">
				<Button variant="tertiary" size="small" onclick={loadMore}>Load more</Button>
			</div>
		{/if}
	</SurfaceCard>
{/if}

<style>
	.issues-list {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}

	.view-all {
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-bold);
		color: var(--ax-text-accent);
		text-decoration: none;
	}

	.view-all:hover {
		text-decoration: underline;
	}

	.load-more {
		display: flex;
		justify-content: center;
		padding-top: var(--ax-space-4);
	}
</style>
