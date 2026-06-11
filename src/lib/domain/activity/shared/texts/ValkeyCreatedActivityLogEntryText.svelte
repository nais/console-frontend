<script lang="ts">
	import Meta from '../../Meta.svelte';
	import { activityLogResourceLink, resourceTypeToText } from '../../utils';
	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'ValkeyCreatedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	{resourceTypeToText(data.resourceType)}
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
	created
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.

	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'VALKEY_CREATED'
		}}
	/>
</div>
