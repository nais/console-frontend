<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'ValkeyCredentialsCreatedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Valkey credentials created
	{#if data.resourceName}
		for <strong>{data.resourceName}</strong>
	{/if}
	{#if data.valkeyCredentialsData.permission}
		with {data.valkeyCredentialsData.permission} access
	{/if}
	(TTL: {data.valkeyCredentialsData.ttl})
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'VALKEY_CREDENTIALS_CREATED'
		}}
	/>
</div>
