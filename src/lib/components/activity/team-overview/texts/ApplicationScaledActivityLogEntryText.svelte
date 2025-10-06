<script lang="ts">
	import type { TeamOverviewActivityLog$result } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';
	import { resourceLink } from '../../utils';

	let {
		data
	}: {
		data: Extract<
			TeamOverviewActivityLog$result['team']['activityLog']['edges'][number]['node'],
			{ __typename: 'ApplicationScaledActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	Application <a
		href={resourceLink(
			data.environmentName ?? '',
			data.resourceType,
			data.resourceName,
			data.teamSlug
		)}>{data.resourceName}</a
	>
	scaled {data.appScaled.direction} to {data.appScaled.newSize} instances in <Tag
		size="small"
		variant={envTagVariant(data.environmentName || '')}>{data.environmentName}</Tag
	>

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
