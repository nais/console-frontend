<script lang="ts">
	import Meta from '../../Meta.svelte';

	import { activityLogResourceLink } from '../../utils';
	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'SecretValueUpdatedActivityLogEntry'>;
		mode?: TimelineModes;
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
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'SECRET_VALUE_UPDATED'
		}}
	/>
</div>
