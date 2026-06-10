<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode = 'full'
	}: {
		data: ActivityLogEntry<'TeamEnvironmentUpdatedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	{data.message}
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.
	{#if mode === 'full' && data.teamEnvironmentUpdated.updatedFields.length > 0}
		{#each data.teamEnvironmentUpdated.updatedFields as field (field)}
			<strong>{field.field}</strong>: Changed from <i>{field.oldValue}</i> to
			<i>{field.newValue}</i>.
		{/each}
	{/if}

	<Meta actor={data.actor} createdAt={data.createdAt} {mode} />
</div>
