<script lang="ts">
	import { graphql } from '$houdini';
	import { Button, Heading, Loader } from '@nais/ds-svelte-community';
	import IssueListItem from '../list/IssueListItem.svelte';
	import List from '../list/List.svelte';

	interface Props {
		teamSlug: string;
	}

	let { teamSlug }: Props = $props();

	const first = 5;

	const teamHealth = graphql(`
		query TeamHealth($teamSlug: Slug!, $first: Int!) {
			team(slug: $teamSlug) {
				issues(first: $first) @paginate(mode: Infinite) {
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
	<Heading level="2" size="small" spacing><a href="/team/{teamSlug}/issues">Health</a></Heading>
	{#if !$teamHealth.fetching}
		{#if ($teamHealth.data?.team.issues.edges.length ?? 0) > 0}
			<List
				title="{$teamHealth.data?.team.issues.edges.length ?? 0} of {$teamHealth.data?.team.issues
					.pageInfo.totalCount ?? 0} issues"
			>
				{#each $teamHealth.data?.team.issues.edges ?? [] as issue (issue.node.id)}
					<IssueListItem item={issue.node} />
				{/each}
			</List>
		{/if}

		{#if ($teamHealth.data?.team.issues.edges.length ?? 0) == 0}
			<span style="color: var(--ax-text-neutral); font-size: 1.2rem; font-weight: bold">
				No issues found
			</span>
		{/if}
	{:else}
		<div style="display: flex; justify-content: center; align-items: center; height: 290px;">
			<Loader size="3xlarge" />
		</div>
	{/if}
	{#if $teamHealth.data?.team?.issues.pageInfo.hasNextPage}
		<div class="load-more">
			<Button variant="tertiary" size="small" onclick={loadMore}>Load more issues</Button>
		</div>
	{/if}
</div>

<style>
	.issues-wrapper {
		padding-bottom: var(--spacing-layout);
	}
	.load-more {
		display: flex;
		justify-content: center;
		padding: var(--ax-space-4) 0;
	}
</style>
