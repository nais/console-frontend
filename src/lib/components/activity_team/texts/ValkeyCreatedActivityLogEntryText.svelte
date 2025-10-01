<script lang="ts">
	import type { TeamOverviewActivityLog$result } from '$houdini';
	import { resourceTypeToText } from '$lib/components/activity/texts/utils';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			TeamOverviewActivityLog$result['team']['activityLog']['edges'][number]['node'],
			{ __typename: 'ValkeyCreatedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	{resourceTypeToText(data.resourceType)}
	<strong>{data.resourceName}</strong> created in <Tag
		size="small"
		variant={envTagVariant(data.environmentName || '')}>{data.environmentName}</Tag
	>.

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
