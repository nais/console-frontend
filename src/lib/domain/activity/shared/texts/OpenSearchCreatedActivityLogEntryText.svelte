<script lang="ts">
	import Meta from '../../Meta.svelte';
	import { resourceTypeToText } from '$lib/domain/activity/sidebar/texts/utils';

	import { activityLogResourceLink } from '../../utils';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'OpenSearchCreatedActivityLogEntry'>;
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

	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
