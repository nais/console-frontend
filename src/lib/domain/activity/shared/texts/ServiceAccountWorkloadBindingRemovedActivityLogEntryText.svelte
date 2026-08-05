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

	const binding = $derived(data.serviceAccountWorkloadBindingRemoved);
	const href = $derived(
		binding.workloadType && data.environmentName
			? `/team/${binding.teamSlug}/${data.environmentName}/${binding.workloadType === 'JOB' ? 'job' : 'app'}/${binding.workloadName}`
			: null
	);
</script>

<div>
	Workload
	{#if href}
		<a {href}>{data.serviceAccountWorkloadBindingRemoved.workloadName}</a>
	{:else}
		<span class="name">{data.serviceAccountWorkloadBindingRemoved.workloadName}</span>
	{/if}
	{#if data.serviceAccountWorkloadBindingRemoved.teamSlug && data.serviceAccountWorkloadBindingRemoved.teamSlug !== data.teamSlug}
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
