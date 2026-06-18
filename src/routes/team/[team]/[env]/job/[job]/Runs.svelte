<script lang="ts">
	import { graphql } from '$houdini';
	import JobRunListItem from '$lib/domain/list-items/JobRunListItem.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import { Button } from '@nais/ds-svelte-community';
	import { onMount } from 'svelte';

	interface Props {
		teamSlug: string;
		environment: string;
		jobName: string;
		ondelete?: (runName: string) => void;
	}

	let { teamSlug, environment, jobName, ondelete }: Props = $props();

	onMount(() => {
		const interval = setInterval(() => refetch(), 10_000);
		return () => clearInterval(interval);
	});

	const runsQuery = graphql(`
		query JobRunsList($team: Slug!, $env: String!, $job: String!, $first: Int!)
		@cache(policy: CacheAndNetwork) {
			team(slug: $team) {
				environment(name: $env) {
					job(name: $job) {
						runs(first: $first) @paginate(mode: Infinite, name: "All_Runs") {
							edges {
								node {
									id
									name
									startTime
									completionTime
									duration
									instances {
										pageInfo {
											totalCount
										}
									}
									status {
										message
										state
									}
									trigger {
										type
										actor
									}
								}
							}
							pageInfo {
								hasNextPage
								totalCount
							}
						}
					}
				}
			}
		}
	`);

	$effect(() => {
		runsQuery.fetch({ variables: { team: teamSlug, env: environment, job: jobName, first: 5 } });
	});

	export function refetch() {
		runsQuery.fetch({
			variables: { team: teamSlug, env: environment, job: jobName, first: 20 },
			policy: 'NoCache'
		});
	}

	let runs = $derived($runsQuery.data?.team?.environment?.job?.runs);
	let runEdges = $derived(runs?.edges ?? []);
	let totalCount = $derived(runs?.pageInfo?.totalCount ?? runEdges.length);
	let hasNextPage = $derived(runs?.pageInfo?.hasNextPage ?? false);
	let loadingMore = $state(false);

	async function loadMore() {
		loadingMore = true;
		await runsQuery.loadNextPage({ first: 20 });
		loadingMore = false;
	}
</script>

{#if runEdges.length > 0 || $runsQuery.fetching}
	<List title="Job runs" count={totalCount} level="h2">
		{#each runEdges as run (run.node.id)}
			{#if run.node.instances.pageInfo.totalCount > 0}
				<JobRunListItem
					run={run.node}
					urlBase="/team/{teamSlug}/{environment}/job/{jobName}/logs?instance="
					{ondelete}
				/>
			{:else}
				<JobRunListItem run={run.node} {ondelete} />
			{/if}
		{:else}
			<ListItem>
				<span class="empty-state">No runs found</span>
			</ListItem>
		{/each}
	</List>
	{#if hasNextPage}
		<div class="load-more">
			<Button variant="tertiary" size="small" onclick={loadMore} loading={loadingMore}
				>Load more</Button
			>
		</div>
	{/if}
{:else if !$runsQuery.fetching}
	<List title="Job runs" count={0} level="h2">
		<ListItem>
			<span class="empty-state">No runs found</span>
		</ListItem>
	</List>
{/if}

<style>
	.empty-state {
		padding: var(--ax-space-16) var(--ax-space-24);
	}

	.load-more {
		display: flex;
		justify-content: center;
		padding-top: var(--ax-space-8);
	}
</style>
