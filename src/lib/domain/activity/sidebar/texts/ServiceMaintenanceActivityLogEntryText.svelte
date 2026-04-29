<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';
	import { activityLogResourceLink } from '../../utils';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'ServiceMaintenanceActivityLogEntry' }
		>;
	} = $props();

	const link = $derived(
		data.environmentName
			? activityLogResourceLink(
					data.environmentName,
					data.resourceType,
					data.resourceName,
					data.teamSlug
				)
			: null
	);

	const properServiceName = (type: string) =>
		type === 'OPENSEARCH' ? 'OpenSearch' : type === 'VALKEY' ? 'Valkey' : 'service';
</script>

<div>
	Started maintenance on {properServiceName(data.resourceType)}
	{#if link}
		<a href={link}><strong>{data.resourceName}</strong></a>
	{:else}
		<strong>{data.resourceName}</strong>
	{/if}
	{#if data.environmentName}
		in {data.environmentName}
	{/if}
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
