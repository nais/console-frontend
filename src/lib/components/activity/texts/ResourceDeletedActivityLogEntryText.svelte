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
			{ resourceType: string; resourceName: string; environmentName: string | null }
		>;
	} = $props();

	function resourceTypeToText(type: string) {
		switch (type) {
			case 'APP':
				return 'Application';
			case 'JOB':
				return 'Job';
			case 'VALKEY':
				return 'Valkey';
			case 'OPENSEARCH':
				return 'OpenSearch';
			default:
				return 'Resource';
		}
	}
</script>

<div>
	{resourceTypeToText(data.resourceType)}
	{data.resourceName} deleted in
	<Tag size="small" variant={envTagVariant(data.environmentName || '')}>{data.environmentName}</Tag
	>.

	<BodyShort textColor="subtle" size="small">
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
