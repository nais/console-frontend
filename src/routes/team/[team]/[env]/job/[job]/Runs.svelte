<script lang="ts">
	import type { JobRunsListStore } from '$houdini';
	import JobRunListItem from '#lib/domain/list-items/JobRunListItem.svelte';
	import Collection from '#lib/ui/Collection.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import ListItem from '#lib/ui/ListItem.svelte';
	import { Button, ShSpinner } from '#lib/shadcn/ui/index.js';
	import { onMount } from 'svelte';

	interface Props {
		runsQuery: JobRunsListStore;
		jobPath: string;
		ondelete?: (runName: string) => void;
	}

	let { runsQuery, jobPath, ondelete }: Props = $props();

	onMount(() => {
		const interval = setInterval(() => refetch(), 10_000);
		return () => clearInterval(interval);
	});

	export async function refetch() {
		try {
			await runsQuery.fetch({ policy: 'NetworkOnly' });
			loadError = null;
		} catch {
			loadError = 'Could not refresh job runs.';
		}
	}

	let runs = $derived($runsQuery.data?.team?.environment?.job?.runs);
	let runEdges = $derived(runs?.edges ?? []);
	let totalCount = $derived(runs?.pageInfo?.totalCount ?? runEdges.length);
	let hasNextPage = $derived(runs?.pageInfo?.hasNextPage ?? false);
	let loadingMore = $state(false);
	let paginationErrors = $state<{ message: string }[] | null>(null);
	let loadError = $state<string | null>(null);
	const errors = $derived(loadError ? [{ message: loadError }] : $runsQuery.errors);

	async function loadMore() {
		loadingMore = true;
		paginationErrors = null;
		try {
			paginationErrors = (await runsQuery.loadNextPage({ first: 20 })).errors;
		} catch {
			paginationErrors = [{ message: 'Could not load more job runs.' }];
		} finally {
			loadingMore = false;
		}
	}
</script>

<Collection title="Job runs" count={runs ? totalCount : undefined} level="h2">
	{#if errors?.length}
		<div class="empty-state"><GraphErrors size="small" {errors} /></div>
	{/if}
	{#each runEdges as { node } (node.id)}
		<JobRunListItem run={node} {jobPath} {ondelete} />
	{:else}
		{#if $runsQuery.fetching && !errors?.length}
			<div class="empty-state" role="status" aria-label="Loading job runs">
				<ShSpinner size="sm" />
			</div>
		{:else if !errors?.length}
			<ListItem>
				<span class="empty-state">No runs found</span>
			</ListItem>
		{/if}
	{/each}
</Collection>
{#if hasNextPage}
	<div class="load-more">
		<GraphErrors size="small" errors={paginationErrors} />
		<Button
			variant="tertiary"
			size="small"
			onclick={loadMore}
			loading={loadingMore}
			disabled={$runsQuery.fetching}
		>
			Load more runs
		</Button>
	</div>
{/if}

<style>
	.empty-state {
		padding: var(--nais-space-16) var(--nais-space-24);
	}

	.load-more {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: var(--nais-space-8);
	}
</style>
