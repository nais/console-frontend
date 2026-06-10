<script lang="ts">
	import { type ActivityLogFilter, graphql } from '$houdini';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { Loader } from '@nais/ds-svelte-community';

	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import ActivityTimeline from './ActivityTimeline.svelte';

	interface Props {
		teamSlug: string;
		filter?: ActivityLogFilter;
		viewAllHref: string;
		title?: string;
	}

	let { teamSlug, filter, viewAllHref, title = 'Activity' }: Props = $props();

	const viewAllLink = $derived.by(() => {
		const params = new SvelteURLSearchParams();
		if (filter?.activityTypes?.length) {
			params.set('activityTypes', filter.activityTypes.join(','));
		}
		if (filter?.resourceTypes?.length) {
			params.set('resourceTypes', filter.resourceTypes.join(','));
		}
		if (filter?.environments?.length) {
			params.set('environments', filter.environments.join(','));
		}
		const qs = params.toString();
		return qs ? `${viewAllHref}?${qs}` : viewAllHref;
	});

	const first = 5;

	const activityQuery = graphql(`
		query TeamActivityCard($teamSlug: Slug!, $first: Int!, $filter: ActivityLogFilter) {
			team(slug: $teamSlug) {
				activityLog(first: $first, filter: $filter) @paginate(mode: Infinite) {
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
	`);

	$effect(() => {
		activityQuery.fetch({ variables: { teamSlug, first, filter } });
	});

	let loadingMore = $state(false);

	async function loadMore() {
		loadingMore = true;
		await activityQuery.loadNextPage({ first });
		loadingMore = false;
	}

	const entries = $derived(($activityQuery.data?.team?.activityLog.edges ?? []).map((e) => e.node));
	const hasNextPage = $derived(
		$activityQuery.data?.team?.activityLog.pageInfo.hasNextPage ?? false
	);
</script>

<SurfaceCard {title}>
	{#snippet headerAside()}
		<a class="view-all" href={viewAllLink}>View all</a>
	{/snippet}

	{#if $activityQuery.fetching && entries.length === 0}
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
