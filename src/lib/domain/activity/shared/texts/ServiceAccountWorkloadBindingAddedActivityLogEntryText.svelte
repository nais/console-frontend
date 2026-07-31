<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'ServiceAccountWorkloadBindingAddedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Workload <span class="name">{data.serviceAccountWorkloadBindingAdded.workloadName}</span>
	{#if data.serviceAccountWorkloadBindingAdded.teamSlug !== data.teamSlug}
		in team <span class="name">{data.serviceAccountWorkloadBindingAdded.teamSlug}</span>
	{/if}
	added to service account <span class="name">{data.resourceName}</span>
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'SERVICE_ACCOUNT_WORKLOAD_BINDING_ADDED'
		}}
	/>
</div>

<style>
	.name {
		font-weight: bold;
		word-break: break-all;
	}
</style>
