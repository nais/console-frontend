<script lang="ts">
	import Meta from '../../Meta.svelte';

	import { activityLogResourceLink } from '../../utils';
	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'SecretValueAddedActivityLogEntry'>;
		mode?: TimelineModes;
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

	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'SECRET_VALUE_ADDED'
		}}
	/>
</div>

<style>
	.valueName {
		font-weight: bold;
		word-break: break-all;
	}
</style>
