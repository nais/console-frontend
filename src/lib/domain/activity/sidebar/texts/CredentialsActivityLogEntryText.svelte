<script lang="ts">
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';
	import type { SidebarActivityLogFragment$data } from '$houdini';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'CredentialsActivityLogEntry' }
		>;
	} = $props();

	const serviceTypeLabel: Record<string, string> = {
		OPENSEARCH: 'OpenSearch',
		VALKEY: 'Valkey',
		KAFKA: 'Kafka'
	};

	const serviceLabel = $derived(serviceTypeLabel[data.resourceType] ?? data.resourceType);
</script>

<div>
	<BodyLong size="small">
		{serviceLabel} credentials created
		{#if data.resourceName}
			for <strong>{data.resourceName}</strong>
		{/if}
		{#if data.credentialsData.permission}
			with {data.credentialsData.permission} access
		{/if}
		(TTL: {data.credentialsData.ttl})
		{#if data.environmentName}
			in {data.environmentName}
		{/if}.
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
