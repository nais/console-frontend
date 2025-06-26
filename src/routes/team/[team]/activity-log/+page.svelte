<script lang="ts">
	import ActivityLogItem from '$lib/components/ActivityLogItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import ListItem from '$lib/components/list/ListItem.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { ActivityLog } = $derived(data);
</script>

<div>
	{#if $ActivityLog.data}
		{@const ae = $ActivityLog.data.team.activityLog}
		<div class="wrapper">
			<div>
				<BodyLong spacing
					>The Activity Log provides an overview of changes made to your team and its resources
					within the Nais Console application.</BodyLong
				>
				<List title="{ae.pageInfo.totalCount} entries">
					{#each ae.nodes || [] as item (item.id)}
						<ListItem>
							<ActivityLogItem {item} />
						</ListItem>
					{/each}
				</List>
				<Pagination
					page={ae.pageInfo}
					loaders={{
						loadPreviousPage: () =>
							changeParams({
								after: '',
								before: ae.pageInfo.startCursor ?? ''
							}),
						loadNextPage: () =>
							changeParams({
								before: '',
								after: ae.pageInfo.endCursor ?? ''
							})
					}}
				/>
			</div>
		</div>
	{/if}
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}
</style>
