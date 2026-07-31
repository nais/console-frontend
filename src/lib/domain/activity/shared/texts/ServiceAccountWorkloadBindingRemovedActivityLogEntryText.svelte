<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'ServiceAccountWorkloadBindingRemovedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Workload <span class="name">{data.serviceAccountWorkloadBindingRemoved.workloadName}</span>
	{#if data.serviceAccountWorkloadBindingRemoved.teamSlug !== data.teamSlug}
		in team <span class="name">{data.serviceAccountWorkloadBindingRemoved.teamSlug}</span>
	{/if}
	removed from service account <span class="name">{data.resourceName}</span>
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'SERVICE_ACCOUNT_WORKLOAD_BINDING_REMOVED'
		}}
	/>
</div>

<style>
	.name {
		font-weight: bold;
		word-break: break-all;
	}
</style>
