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

	const binding = $derived(data.serviceAccountWorkloadBindingAdded);
	const href = $derived(
		binding.workloadType && data.environmentName
			? `/team/${binding.teamSlug}/${data.environmentName}/${binding.workloadType === 'JOB' ? 'job' : 'app'}/${binding.workloadName}`
			: null
	);
</script>

<div>
	Workload
	{#if href}
		<a {href}>{data.serviceAccountWorkloadBindingAdded.workloadName}</a>
	{:else}
		<span class="name">{data.serviceAccountWorkloadBindingAdded.workloadName}</span>
	{/if}
	{#if data.serviceAccountWorkloadBindingAdded.teamSlug && data.serviceAccountWorkloadBindingAdded.teamSlug !== data.teamSlug}
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
