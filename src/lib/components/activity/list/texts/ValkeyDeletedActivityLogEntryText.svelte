<script lang="ts">
	import type { ActivityLogEntryFragment$data } from '$houdini';
	import { resourceTypeToText } from '$lib/components/activity/sidebar/texts/utils';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<ActivityLogEntryFragment$data, { __typename: 'ValkeyDeletedActivityLogEntry' }>;
	} = $props();
</script>

<div>
	{resourceTypeToText(data.resourceType)}
	<strong>{data.resourceName}</strong> deleted

	{#if data.environmentName}
		in <Tag size="small" variant={envTagVariant(data.environmentName)}>{data.environmentName}</Tag>
	{/if}

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
