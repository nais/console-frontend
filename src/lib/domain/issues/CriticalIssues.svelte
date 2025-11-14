<script lang="ts">
	import { graphql } from '$houdini';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import { Button, Heading } from '@nais/ds-svelte-community';

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
							...IssueFragment
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

	const hasCriticalIssues = $derived($teamHealth.data?.team?.issues?.pageInfo?.totalCount ?? 0 > 0);
</script>

{#if $teamHealth.data && hasCriticalIssues && !$teamHealth.fetching}
	<div class="issues-wrapper">
		{#if ($teamHealth.data?.team?.issues?.edges?.length ?? 0) > 0}
			<Heading level="2" size="small" spacing
				><a href="/team/{teamSlug}/issues?severity=CRITICAL">Critical Issues</a></Heading
			>
			<div class="issues-list">
				{#each $teamHealth.data?.team?.issues?.edges ?? [] as issue (issue.node.id)}
					<IssueListItem item={issue.node} />
				{/each}
			</div>
		{/if}

		{#if $teamHealth.data?.team?.issues?.pageInfo?.hasNextPage}
			<div class="load-more">
				<Button variant="tertiary" size="small" onclick={loadMore}>Load more issues</Button>
			</div>
		{/if}
	</div>
{/if}

<style>
	.issues-wrapper {
		padding-bottom: var(--ax-space-8);
	}

	.issues-list {
		display: flex;
		flex-direction: column;
	}

	/* Remove card backgrounds but preserve tag/badge styling */
	.issues-list :global(.list-item) {
		background-color: transparent !important;
		border: none !important;
		padding: var(--ax-space-8) 0 !important;
	}

	.issues-list :global(.list-item:hover) {
		background-color: transparent !important;
	}

	.load-more {
		display: flex;
		justify-content: center;
		padding: var(--ax-space-8) 0;
		margin-top: var(--ax-space-8);
	}
</style>
