<script lang="ts">
	import Meta from '../../Meta.svelte';

	import { activityLogResourceLink } from '../../utils';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'SecretValueAddedActivityLogEntry'>;
	} = $props();
</script>

<div>
	Value
	<span class="valueName">{data.secretValueAdded.valueName}</span> was added to secret
	{#if data.environmentName}
		<a
			href={activityLogResourceLink(
				data.environmentName,
				data.resourceType,
				data.resourceName,
				data.teamSlug
			)}>{data.resourceName}</a
		>
	{:else}
		{data.resourceName}
	{/if}

	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>

<style>
	.valueName {
		font-weight: bold;
		word-break: break-all;
	}
</style>
