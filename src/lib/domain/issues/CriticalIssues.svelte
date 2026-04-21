<script lang="ts">
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import { getContextClient } from '$lib/urql/context';
	import { graphql as gql } from '$lib/urql/gql';
	import { Button, Heading } from '@nais/ds-svelte-community';
	import { queryStore } from '@urql/svelte';

	interface Props {
		teamSlug: string;
	}

	let { teamSlug }: Props = $props();

	let pageSize = $state(5);

	const TeamHealthQuery = gql(/* GraphQL */ `
		query TeamHealth($teamSlug: Slug!, $first: Int!) {
			team(slug: $teamSlug) {
				issues(first: $first, filter: { severity: CRITICAL }) {
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

	const client = getContextClient();

	// `@paginate(mode: Infinite)` from the previous Houdini document has
	// no direct equivalent in urql. As a stop-gap until Phase 3.3 lands a
	// proper infinite-scroll helper for urql, we re-issue the query with
	// a larger `$first` whenever the user clicks "Load more". The
	// document cache de-duplicates the overlapping selection.
	const teamHealth = $derived(
		queryStore({
			client,
			query: TeamHealthQuery,
			variables: { teamSlug, first: pageSize }
		})
	);

	const result = $derived($teamHealth);

	const hasCriticalIssues = $derived((result.data?.team?.issues?.pageInfo?.totalCount ?? 0) > 0);

	function loadMore() {
		pageSize += 5;
	}
</script>

{#if result.data && hasCriticalIssues && !result.fetching}
	<div class="issues-wrapper">
		{#if (result.data?.team?.issues?.edges?.length ?? 0) > 0}
			<Heading as="h2" size="small" spacing
				><a href="/team/{teamSlug}/issues?severity=CRITICAL">Critical Issues</a></Heading
			>
			<div class="issues-list">
				{#each result.data?.team?.issues?.edges ?? [] as issue (issue.node.id)}
					<IssueListItem item={issue.node} />
				{/each}
			</div>
		{/if}

		{#if result.data?.team?.issues?.pageInfo?.hasNextPage}
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
