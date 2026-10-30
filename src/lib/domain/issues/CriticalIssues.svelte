<script lang="ts">
	import type { TeamHealthStore } from '$houdini';
	import { ShButton, ShSpinner } from '#lib/shadcn/ui/index.js';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
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

{#if $store.fetching && !$store.data}
	<SurfaceCard title="Critical issues" bordered>
		<div class="loader">
			<ShSpinner size="lg" />
		</div>
	</SurfaceCard>
{:else if $store.data && hasCriticalIssues}
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
				<ShButton variant="outline" size="sm" onclick={loadMore}>Load more</ShButton>
			</div>
		{/if}
	</SurfaceCard>
{/if}

<style>
	.issues-list {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.loader {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 160px;
	}

	.view-all {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--muted-foreground);
		text-decoration: none;
	}

	.view-all:hover {
		color: var(--foreground);
		text-decoration: underline;
	}

	.load-more {
		display: flex;
		justify-content: center;
		padding-top: 0.5rem;
	}
</style>
