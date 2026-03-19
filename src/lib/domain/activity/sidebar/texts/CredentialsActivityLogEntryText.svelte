<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';

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

	const serviceLabel = $derived(
		serviceTypeLabel[data.credentialsData.serviceType] ?? data.credentialsData.serviceType
	);
</script>

<div>
	{serviceLabel} credentials created
	{#if data.credentialsData.instanceName}
		for <strong>{data.credentialsData.instanceName}</strong>
	{/if}
	{#if data.credentialsData.permission}
		with {data.credentialsData.permission} access
	{/if}
	(TTL: {data.credentialsData.ttl})
	{#if data.environmentName}
		in <Tag size="small" variant={envTagVariant(data.environmentName)}>{data.environmentName}</Tag>
	{/if}
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
