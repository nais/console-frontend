<script lang="ts">
	import type { TeamOverviewActivityLog$result } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			TeamOverviewActivityLog$result['team']['activityLog']['edges'][number]['node'],
			{ __typename: 'JobTriggeredActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	Job <strong>{data.resourceName}</strong> triggered in <Tag
		size="small"
		variant={envTagVariant(data.environmentName || '')}>{data.environmentName}</Tag
	>

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
