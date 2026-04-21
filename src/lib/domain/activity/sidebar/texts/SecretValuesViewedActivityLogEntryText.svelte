<script lang="ts">
	import type { SidebarActivityLogEntry } from './types';
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';
	import { activityLogResourceLink } from '../../utils';

	let {
		data
	}: {
		data: SidebarActivityLogEntry<'SecretValuesViewedActivityLogEntry'>;
	} = $props();
</script>

<div>
	Viewed secret values for
	{#if data.environmentName}
		<a
			href={activityLogResourceLink(
				data.environmentName,
				data.resourceType,
				data.resourceName,
				data.teamSlug
			)}>{data.resourceName}</a
		>
	{:else}
		{data.resourceName}
	{/if}
	{#if data.environmentName}
		in <Tag size="small" variant={envTagVariant(data.environmentName)}>{data.environmentName}</Tag>
	{/if}.
	{#if data.secretValuesViewedData?.reason}
		<BodyShort size="small"><em>Reason: {data.secretValuesViewedData.reason}</em></BodyShort>
	{/if}

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
