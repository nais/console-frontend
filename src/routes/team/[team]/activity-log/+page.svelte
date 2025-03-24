<script lang="ts">
	import ActivityLogItem from '$lib/components/ActivityLogItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import ListItem from '$lib/components/list/ListItem.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { ActivityLog, viewerIsMember, teamSlug } = $derived(data);
</script>

<div>
	{#if viewerIsMember}
		{#if $ActivityLog.data}
			{@const ae = $ActivityLog.data}
			<div class="wrapper">
				<div>
					<List title="{ae.team.activityLog.pageInfo.totalCount} entries">
						{#each ae.team.activityLog.edges as edge (edge.node.id)}
							<ListItem>
								<ActivityLogItem item={edge.node} {teamSlug} />
							</ListItem>
						{/each}
					</List>
					<Pagination
						page={ae.team.activityLog.pageInfo}
						loaders={{
							loadPreviousPage: () =>
								changeParams({
									after: '',
									before: ae.team.activityLog.pageInfo.startCursor ?? ''
								}),
							loadNextPage: () =>
								changeParams({
									before: '',
									after: ae.team.activityLog.pageInfo.endCursor ?? ''
								})
						}}
					/>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}
</style>
