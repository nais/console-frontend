<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'OpenSearchCredentialsCreatedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	OpenSearch credentials created
	{#if data.resourceName}
		for <strong>{data.resourceName}</strong>
	{/if}
	{#if data.opensearchCredentialsData.permission}
		with {data.opensearchCredentialsData.permission} access
	{/if}
	(TTL: {data.opensearchCredentialsData.ttl})
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'OPENSEARCH_CREDENTIALS_CREATED'
		}}
	/>
</div>
