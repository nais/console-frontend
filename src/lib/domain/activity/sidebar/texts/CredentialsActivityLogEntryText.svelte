<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';

	import { activityLogResourceLink } from '../../utils';

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
		{#if data.resourceName && data.environmentName}
			for <a
				href={activityLogResourceLink(
					data.environmentName,
					data.resourceType,
					data.resourceName,
					data.teamSlug
				)}>{data.resourceName}</a
			>
		{:else if data.resourceName}
			for {data.resourceName}
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
