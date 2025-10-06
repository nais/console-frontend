<script lang="ts">
	import type { TeamOverviewActivityLog$result } from '$houdini';
	import { resourceTypeToText } from '$lib/components/activity/sidebar/texts/utils';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';
	import { activityLogResourceLink } from '../../utils';

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
	<a
		href={activityLogResourceLink(
			data.environmentName ?? '',
			data.resourceType,
			data.resourceName,
			data.teamSlug
		)}>{data.resourceName}</a
	>
	created in <Tag size="small" variant={envTagVariant(data.environmentName || '')}
		>{data.environmentName}</Tag
	>.

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
