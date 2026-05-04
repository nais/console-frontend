<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'TeamEnvironmentUpdatedActivityLogEntry'>;
	} = $props();
</script>

<div>
	{data.message}
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.
	{#if data.teamEnvironmentUpdated.updatedFields.length > 0}
		{#each data.teamEnvironmentUpdated.updatedFields as field (field)}
			<strong>{field.field}</strong>: Changed from <i>{field.oldValue}</i> to
			<i>{field.newValue}</i>.
		{/each}
	{/if}

	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
