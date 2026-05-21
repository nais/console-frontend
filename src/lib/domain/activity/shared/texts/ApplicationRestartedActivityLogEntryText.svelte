<script lang="ts">
	import Meta from '../../Meta.svelte';

	import { activityLogResourceLink } from '../../utils';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'ApplicationRestartedActivityLogEntry'>;
	} = $props();
</script>

<div>
	Application
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
	restarted
	{#if data.environmentName}
		in {data.environmentName}
	{/if}

	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
