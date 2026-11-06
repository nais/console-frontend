<script lang="ts">
	import type { TeamWebhookActivityStore, TeamWebhooksActivityStore } from '$houdini';
	import ActivityTimeline from '#lib/domain/activity/ActivityTimeline.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';

	let {
		activityStore
	}: {
		activityStore:
			| Pick<TeamWebhookActivityStore, 'subscribe' | 'loadNextPage'>
			| Pick<TeamWebhooksActivityStore, 'subscribe' | 'loadNextPage'>;
	} = $props();

	const activity = $derived.by(() => {
		const data = $activityStore.data;
		if (!data) return null;
		if ('team' in data) return data.team.activityLog;
		return data.node?.__typename === 'WebhookSubscription' ? data.node.activityLog : null;
	});
	let loadingMore = $state(false);
	let paginationErrors = $state<{ message: string }[] | null>(null);

	async function loadMore() {
		if (loadingMore) return;
		loadingMore = true;
		paginationErrors = null;
		try {
			const result = await activityStore.loadNextPage();
			paginationErrors = result.errors;
		} catch (error) {
			console.error('Unable to load more webhook activity:', error);
			paginationErrors = [{ message: 'Unable to load more activity. Try again.' }];
		} finally {
			loadingMore = false;
		}
	}
</script>

<SurfaceCard title="Activity">
	<GraphErrors errors={$activityStore.errors} />
	<GraphErrors errors={paginationErrors} />
	{#if activity}
		<ActivityTimeline
			entries={activity.edges.map((edge) => edge.node)}
			hasNextPage={activity.pageInfo.hasNextPage}
			loading={loadingMore || $activityStore.fetching}
			{loadMore}
		/>
	{/if}
</SurfaceCard>
