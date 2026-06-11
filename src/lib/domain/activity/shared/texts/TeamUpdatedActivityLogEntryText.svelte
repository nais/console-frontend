<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'TeamUpdatedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	{data.message}
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.
	{#if mode === 'full' && data.teamUpdated?.updatedFields.length}
		{#each data.teamUpdated?.updatedFields as field (field)}
			{field.field}. Changed from <i>{field.oldValue}</i> to <i>{field.newValue}</i>.
		{/each}
	{/if}

	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'TEAM_UPDATED'
		}}
	/>
</div>
