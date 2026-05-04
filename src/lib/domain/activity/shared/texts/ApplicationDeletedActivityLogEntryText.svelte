<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'ApplicationDeletedActivityLogEntry'>;
	} = $props();
</script>

<div>
	Application <strong>{data.resourceName}</strong> was deleted

	{#if data.environmentName}
		in {data.environmentName}
	{/if}

	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
