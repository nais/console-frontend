<script lang="ts">
	import { graphql } from '$houdini';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { Loader } from '@nais/ds-svelte-community';

	import ActivityTimeline from './ActivityTimeline.svelte';

	interface Props {
		teamSlug: string;
		env: string;
		workload: string;
		workloadType: 'app' | 'job';
		viewAllHref: string;
		title?: string;
	}

	let {
		teamSlug,
		env,
		workload,
		workloadType,
		viewAllHref,
		title = 'Latest activities'
	}: Props = $props();

	const first = 5;

	const appActivityQuery = graphql(`
		query WorkloadActivityCardApp(
			$teamSlug: Slug!
			$env: String!
			$workload: String!
			$first: Int!
		) {
			team(slug: $teamSlug) {
				environment(name: $env) {
					application(name: $workload) {
						activityLog(first: $first) @paginate(mode: Infinite) {
							pageInfo {
								endCursor
								hasNextPage
							}
							edges {
								node {
									id
									actor
									message
									createdAt
									resourceName
									resourceType
									environmentName
									teamSlug
									__typename
									...ActivityLogEntryFragment
								}
							}
						}
					}
				}
			}
		}
	`);

	const jobActivityQuery = graphql(`
		query WorkloadActivityCardJob(
			$teamSlug: Slug!
			$env: String!
			$workload: String!
			$first: Int!
		) {
			team(slug: $teamSlug) {
				environment(name: $env) {
					job(name: $workload) {
						activityLog(first: $first) @paginate(mode: Infinite) {
							pageInfo {
								endCursor
								hasNextPage
							}
							edges {
								node {
									id
									actor
									message
									createdAt
									resourceName
									resourceType
									environmentName
									teamSlug
									__typename
									...ActivityLogEntryFragment
								}
							}
						}
					}
				}
			}
		}
	`);

	$effect(() => {
		if (workloadType === 'app') {
			appActivityQuery.fetch({ variables: { teamSlug, env, workload, first } });
		} else {
			jobActivityQuery.fetch({ variables: { teamSlug, env, workload, first } });
		}
	});

	let loadingMore = $state(false);

	async function loadMore() {
		loadingMore = true;
		if (workloadType === 'app') {
			await appActivityQuery.loadNextPage({ first });
		} else {
			await jobActivityQuery.loadNextPage({ first });
		}
		loadingMore = false;
	}

	const entries = $derived.by(() => {
		if (workloadType === 'app') {
			return ($appActivityQuery?.data?.team?.environment?.application?.activityLog.edges ?? []).map(
				(e) => e.node
			);
		}
		return ($jobActivityQuery?.data?.team?.environment?.job?.activityLog.edges ?? []).map(
			(e) => e.node
		);
	});

	const hasNextPage = $derived.by(() => {
		if (workloadType === 'app') {
			return (
				$appActivityQuery?.data?.team?.environment?.application?.activityLog.pageInfo.hasNextPage ??
				false
			);
		}
		return (
			$jobActivityQuery?.data?.team?.environment?.job?.activityLog.pageInfo.hasNextPage ?? false
		);
	});

	const fetching = $derived(
		workloadType === 'app' ? $appActivityQuery?.fetching : $jobActivityQuery?.fetching
	);
</script>

<SurfaceCard {title}>
	{#snippet headerAside()}
		<a class="view-all" href={viewAllHref}>View all</a>
	{/snippet}

	{#if fetching && entries.length === 0}
		<div class="loader">
			<Loader size="3xlarge" />
		</div>
	{:else}
		<ActivityTimeline {entries} {hasNextPage} loading={loadingMore} {loadMore} />
	{/if}
</SurfaceCard>

<style>
	.view-all {
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-bold);
		color: var(--ax-text-accent);
		text-decoration: none;
	}

	.view-all:hover {
		text-decoration: underline;
	}

	.loader {
		display: flex;
		justify-content: center;
		align-items: center;
		min-width: 100%;
		min-height: 200px;
	}
</style>
