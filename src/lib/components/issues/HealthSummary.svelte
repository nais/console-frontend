<script lang="ts">
	import { graphql } from '$houdini';
	import { Heading, Loader } from '@nais/ds-svelte-community';
	import { CircleFillIcon } from '@nais/ds-svelte-community/icons';
	import IssueListItem from '../list/IssueListItem.svelte';
	import List from '../list/List.svelte';

	interface Props {
		teamSlug: string;
	}

	let { teamSlug }: Props = $props();

	const teamHealth = graphql(`
		query TeamHealth($teamSlug: Slug!) {
			team(slug: $teamSlug) {
				issues {
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
		teamHealth.fetch({ variables: { teamSlug } });
	});

	let criticalIssues = $derived(
		$teamHealth.data?.team.issues.edges.filter((node) => node.node.severity === 'CRITICAL')
	);
	let warnings = $derived(
		$teamHealth.data?.team.issues.edges.filter((node) => node.node.severity === 'WARNING')
	);
	let todos = $derived(
		$teamHealth.data?.team.issues.edges.filter((node) => node.node.severity === 'TODO')
	);
</script>

<div class="card issues">
	<Heading level="2" size="small"><a href="/team/{teamSlug}/issues">Health</a></Heading>
	{#if !$teamHealth.fetching}
		{#if (criticalIssues?.length ?? 0) > 0}
			<div class="summary critical">
				<CircleFillIcon />
				<span style="color: var(--ax-text-neutral); font-size: 1.2rem; font-weight: bold"
					>{(criticalIssues?.length ?? 0) > 0 ? criticalIssues?.length : 'No '}
					critical issue{(criticalIssues?.length ?? 0) !== 1 ? 's' : ''}</span
				>
			</div>
			<List>
				{#each criticalIssues ?? [] as issue (issue.node.id)}
					<IssueListItem item={issue.node} />
				{/each}
			</List>
		{/if}
		{#if (warnings?.length ?? 0) > 0}
			<div class="summary warning">
				<CircleFillIcon />
				<span style="color: var(--ax-text-neutral); font-size: 1.2rem; font-weight: bold"
					>{(warnings?.length ?? 0) > 0 ? warnings?.length : 'No'}
					warning{(warnings?.length ?? 0) !== 1 ? 's' : ''}</span
				>
			</div>
			<!-- <List>
				{#each warnings ?? [] as warning (warning.node.id)}
					<IssueListItem item={warning.node} />
				{/each}
			</List> -->
		{/if}
		{#if (todos?.length ?? 0) > 0}
			<div class="summary todo">
				<CircleFillIcon />

				<span style="color: var(--ax-text-neutral); font-size: 1.2rem; font-weight: bold"
					>{(todos?.length ?? 0) > 0 ? todos?.length : 'No'}
					todo{(todos?.length ?? 0) !== 1 ? 's' : ''}</span
				>
			</div>
			<!-- <List>
				{#each todos ?? [] as todo (todo.node.id)}
					<IssueListItem item={todo.node} />
				{/each}
			</List> -->
		{/if}
		{#if (criticalIssues?.length ?? 0) == 0 && (warnings?.length ?? 0) == 0 && (todos?.length ?? 0) == 0}
			<span style="color: var(--ax-text-neutral); font-size: 1.2rem; font-weight: bold">
				No issues found
			</span>
		{/if}
	{:else}
		<div style="display: flex; justify-content: center; align-items: center; height: 290px;">
			<Loader size="3xlarge" />
		</div>
	{/if}
</div>

<style>
	.card {
		/* padding: var(--ax-space-16) var(--ax-space-20); */
		align-items: stretch;
	}

	.issues {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		padding-bottom: var(--ax-space-32);
	}

	.summary {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
	}

	.todo {
		color: light-dark(var(--ax-bg-info-strong), var(--ax-bg-info-strong));
	}
	.warning {
		color: light-dark(var(--ax-bg-warning-moderate-pressed), var(--ax-bg-warning-strong-pressed));
	}
	.critical {
		color: light-dark(var(--ax-bg-danger-strong), var(--ax-bg-danger-strong));
	}
</style>
