<script lang="ts">
	import { BodyShort } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';

	import { activityLogResourceLink } from '../../utils';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'SecretValuesViewedActivityLogEntry'>;
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
	{#if data.secretValuesViewed?.reason}
		<BodyShort size="small"><em>Reason: {data.secretValuesViewed.reason}</em></BodyShort>
	{/if}

	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
