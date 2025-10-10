<script lang="ts">
	import { graphql } from '$houdini';
	import { Button, Heading, Loader } from '@nais/ds-svelte-community';
	import IssueListItem from '../list/IssueListItem.svelte';

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

	$effect.pre(() => {
		teamHealth.fetch({ variables: { teamSlug, first } });
	});

	async function loadMore() {
		await teamHealth.loadNextPage({ first: 5 });
	}
</script>

<div class="issues-wrapper">
	<Heading level="2" size="small" spacing
		><a href="/team/{teamSlug}/issues?severity=CRITICAL">Critical Issues</a></Heading
	>

	{#if !$teamHealth.data}
		<!-- Første innlasting: vis loader uansett fetching-flagget -->
		<div style="display: flex; justify-content: center; align-items: center; height: 290px;">
			<Loader size="3xlarge" />
		</div>
	{:else}
		{#if ($teamHealth.data?.team?.issues?.edges?.length ?? 0) > 0}
			<div class="issues-list">
				{#each $teamHealth.data?.team?.issues?.edges ?? [] as issue (issue.node.id)}
					<IssueListItem item={issue.node} />
				{/each}
			</div>
		{:else if !$teamHealth.fetching}
			<!-- Kun når vi har data, og ikke fetcher, men lista er tom -->
			<span style="color: var(--ax-text-neutral); font-size: 1.2rem; font-weight: bold">
				No critical issues found
			</span>
		{/if}

		<!-- Valgfritt: liten “background” loader ved refetch/paginate -->
		{#if $teamHealth.fetching}
			<div style="display: flex; justify-content: center; align-items: center; height: 60px;">
				<Loader size="large" />
			</div>
		{/if}
	{/if}

	{#if $teamHealth.data?.team?.issues?.pageInfo?.hasNextPage}
		<div class="load-more">
			<Button variant="tertiary" size="small" onclick={loadMore}>Load more issues</Button>
		</div>
	{/if}
</div>

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
