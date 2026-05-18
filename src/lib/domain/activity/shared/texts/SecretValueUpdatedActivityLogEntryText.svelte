<script lang="ts">
	import Meta from '../../Meta.svelte';

	import { activityLogResourceLink } from '../../utils';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'SecretValueUpdatedActivityLogEntry'>;
	} = $props();
</script>

<div>
	Value <strong>{data.secretValueUpdated.valueName}</strong> in secret
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
	was updated
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
