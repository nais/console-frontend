<script lang="ts">
	import Meta from '../../Meta.svelte';
	import { activityLogResourceLink, resourceTypeToText } from '../../utils';
	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'ServiceMaintenanceActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();

	const link = $derived(
		data.environmentName
			? activityLogResourceLink(
					data.environmentName,
					data.resourceType,
					data.resourceName,
					data.teamSlug
				)
			: null
	);
</script>

<div>
	Started maintenance on {resourceTypeToText(data.resourceType)}
	{#if link}
		<a href={link}><strong>{data.resourceName}</strong></a>
	{:else}
		<strong>{data.resourceName}</strong>
	{/if}

	{#if data.environmentName}
		in {data.environmentName}
	{/if}

	<Meta actor={data.actor} createdAt={data.createdAt} {mode} />
</div>
