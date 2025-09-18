<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'ClusterAuditActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	{data.clusterAuditData?.action}ed
	{data.clusterAuditData?.resourceKind.toLowerCase()}
	{data.resourceName} in
	<Tag size="small" variant={envTagVariant(data.environmentName || '')}>{data.environmentName}</Tag>

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
