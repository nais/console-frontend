<script lang="ts">
	import Meta from './Meta.svelte';
	import type { WorkloadActivityEntry } from './types';

	let {
		data
	}: {
		data: WorkloadActivityEntry<
			'RepositoryAddedActivityLogEntry' | 'RepositoryRemovedActivityLogEntry'
		>;
	} = $props();
</script>

<div>
	{#if data.__typename === 'RepositoryAddedActivityLogEntry'}
		Added repository {data.resourceName}
	{:else}
		Removed repository {data.resourceName}
	{/if}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
