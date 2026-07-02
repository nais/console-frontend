<script lang="ts">
	import { graphql } from '$houdini';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { Button } from '@nais/ds-svelte-community';
	import CriticalIssueRow from './CriticalIssueRow.svelte';

	interface Props {
		teamSlug: string;
	}

	let { teamSlug }: Props = $props();

	const first = 5;

	const teamHealth = graphql(`
		query TeamHealth($teamSlug: Slug!, $first: Int!) {
			team(slug: $teamSlug) {
				issues(first: $first, filter: { severity: CRITICAL }) @paginate(mode: Infinite) {
					pageInfo {
						endCursor
						hasNextPage
						totalCount
					}
					edges {
						node {
							id
							severity
							...IssueFragment @mask_disable
						}
					}
				}
			}
		}
	`);

	$effect(() => {
		teamHealth.fetch({ variables: { teamSlug, first } });
	});

	async function loadMore() {
		await teamHealth.loadNextPage({ first: 5 });
	}

	const hasCriticalIssues = $derived(
		($teamHealth.data?.team?.issues?.pageInfo?.totalCount ?? 0) > 0
	);
	const totalCount = $derived($teamHealth.data?.team?.issues?.pageInfo?.totalCount ?? 0);
</script>

{#if $teamHealth.data && hasCriticalIssues && !$teamHealth.fetching}
	<SurfaceCard title="Critical issues ({totalCount})" bordered>
		{#snippet headerAside()}
			<a class="view-all" href="/team/{teamSlug}/issues">View all</a>
		{/snippet}
		<div class="issues-list">
			{#each $teamHealth.data?.team?.issues?.edges ?? [] as issue (issue.node.id)}
				<CriticalIssueRow issue={issue.node} {teamSlug} />
			{/each}
		</div>

		{#if $teamHealth.data?.team?.issues?.pageInfo?.hasNextPage}
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
