<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'ClusterAuditActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	{data.message}
	{#if data.environmentName}
		in {data.environmentName}
	{/if}

	<Meta actor={data.actor} createdAt={data.createdAt} {mode} />
</div>
