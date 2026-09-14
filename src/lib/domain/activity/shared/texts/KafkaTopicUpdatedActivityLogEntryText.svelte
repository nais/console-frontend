<script lang="ts">
	import { ReadMore } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';
	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'KafkaTopicUpdatedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Kafka topic updated
	{#if data.resourceName && data.environmentName}
		for <strong>{data.resourceName}</strong> in {data.environmentName}
	{/if}
	{#if mode === 'full'}
		<ReadMore header="Kafka topic updated">
			{#if data.kafkaTopicUpdatedData.addedGrants.length > 0}
				{#each data.kafkaTopicUpdatedData.addedGrants as grant, index (index)}
					<code>{grant.access}</code> granted to
					<strong>{grant.subject}</strong>
					in team
					<strong>{grant.teamName}</strong><br />
				{/each}
			{/if}
			{#if data.kafkaTopicUpdatedData.revokedGrants.length > 0}
				{#each data.kafkaTopicUpdatedData.revokedGrants as grant, index (index)}
					<code>{grant.access}</code> revoked from
					<strong>{grant.subject}</strong>
					in team
					<strong>{grant.teamName}</strong><br />
				{/each}
			{/if}
		</ReadMore>
	{/if}
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'KAFKA_TOPIC_UPDATED'
		}}
	/>
</div>

<style>
	code {
		font-family: 'Courier New', Courier, monospace;
		background-color: var(--ax-bg-neutral-soft);
		padding: 0.1rem 0.3rem;
		border-radius: var(--ax-radius-4);
	}
</style>
