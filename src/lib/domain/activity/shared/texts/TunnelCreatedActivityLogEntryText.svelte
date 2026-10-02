<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode = 'full'
	}: {
		data: ActivityLogEntry<'TunnelCreatedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Opened network tunnel to <strong>{data.tunnelCreated.targetHost}</strong>
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.
	{#if mode === 'full'}
		<p>Tunnel: {data.tunnelCreated.tunnelName}</p>
	{/if}
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{ ...data, activityType: 'TUNNEL_CREATED' }}
	/>
</div>
