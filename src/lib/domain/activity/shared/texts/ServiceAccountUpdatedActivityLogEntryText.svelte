<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'ServiceAccountUpdatedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Service account <span class="name">{data.resourceName}</span> updated.
	{#if mode === 'full' && data.serviceAccountUpdated?.updatedFields.length}
		{#each data.serviceAccountUpdated.updatedFields as field (field.field)}
			{field.field}. Changed from <i>{field.oldValue}</i> to <i>{field.newValue}</i>.
		{/each}
	{/if}

	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'SERVICE_ACCOUNT_UPDATED'
		}}
	/>
</div>

<style>
	.name {
		font-weight: bold;
		word-break: break-all;
	}
</style>
