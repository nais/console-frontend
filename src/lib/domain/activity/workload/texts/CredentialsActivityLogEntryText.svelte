<script lang="ts">
	import Meta from './Meta.svelte';
	import type { WorkloadActivityEntry } from './types';

	let {
		data
	}: {
		data: WorkloadActivityEntry<'CredentialsActivityLogEntry'>;
	} = $props();

	const permission = $derived(
		data.credentialsData?.permission
			? data.credentialsData.permission.toLowerCase().replaceAll('_', ' ')
			: null
	);
</script>

<div>
	{#if permission}
		Created {permission} credentials
	{:else}
		Created credentials
	{/if}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
