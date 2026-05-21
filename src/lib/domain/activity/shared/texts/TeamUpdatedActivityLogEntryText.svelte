<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'TeamUpdatedActivityLogEntry'>;
	} = $props();
</script>

<div>
	{data.message}
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.
	{#if data.teamUpdated?.updatedFields.length}
		{#each data.teamUpdated?.updatedFields as field (field)}
			{field.field}. Changed from <i>{field.oldValue}</i> to <i>{field.newValue}</i>.
		{/each}
	{/if}

	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
