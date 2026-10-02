<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'TunnelDeletedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Closed network tunnel <strong>{data.tunnelDeleted.tunnelName}</strong>
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{ ...data, activityType: 'TUNNEL_DELETED' }}
	/>
</div>
