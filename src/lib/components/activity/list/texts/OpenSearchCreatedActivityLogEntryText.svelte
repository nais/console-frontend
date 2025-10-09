<script lang="ts">
	import type { ActivityLogEntryFragment$data } from '$houdini';
	import { resourceTypeToText } from '$lib/components/activity/sidebar/texts/utils';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';
	import { activityLogResourceLink } from '../../utils';

	let {
		data
	}: {
		data: Extract<
			ActivityLogEntryFragment$data,
			{ __typename: 'OpenSearchCreatedActivityLogEntry' }
		>;
	} = $props();

	const link = $derived(
		activityLogResourceLink(
			data.environmentName ?? '',
			data.resourceType,
			data.resourceName,
			data.teamSlug
		)
	);
</script>

<div>
	{resourceTypeToText(data.resourceType)}
	<a href={link}><strong>{data.resourceName}</strong></a>
	created

	{#if data.environmentName}
		in <Tag size="small" variant={envTagVariant(data.environmentName)}>{data.environmentName}</Tag>
	{/if}

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
