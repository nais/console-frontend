<script lang="ts">
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'CredentialsActivityLogEntry'>;
	} = $props();

	const serviceTypeLabel: Record<string, string> = {
		OPENSEARCH: 'OpenSearch',
		VALKEY: 'Valkey',
		KAFKA: 'Kafka'
	};

	const serviceLabel = $derived(serviceTypeLabel[data.resourceType] ?? data.resourceType);
</script>

<div>
	{serviceLabel} credentials created
	{#if data.resourceName}
		for <strong>{data.resourceName}</strong>
	{/if}
	{#if data.credentialsData.permission}
		with {data.credentialsData.permission} access
	{/if}
	(TTL: {data.credentialsData.ttl})
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
