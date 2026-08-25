<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'KafkaCredentialsCreatedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Kafka credentials created
	{#if data.resourceName}
		for <strong>{data.resourceName}</strong>
	{/if}
	(TTL: {data.kafkaCredentialsData.ttl})
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'KAFKA_CREDENTIALS_CREATED'
		}}
	/>
</div>
