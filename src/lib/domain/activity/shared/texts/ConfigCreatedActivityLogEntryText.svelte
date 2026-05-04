<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'ConfigCreatedActivityLogEntry'>;
	} = $props();
</script>

<div>
	Config <strong>{data.resourceName}</strong> created
	{#if data.environmentName}
		in {data.environmentName}
	{/if}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
