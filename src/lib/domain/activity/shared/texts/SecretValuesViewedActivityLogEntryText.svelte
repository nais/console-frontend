<script lang="ts">
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';
	import { activityLogResourceLink } from '../../utils';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'SecretValuesViewedActivityLogEntry'>;
	} = $props();
</script>

<div>
	<strong>{data.actor}</strong> viewed secret values for
	<a
		href={activityLogResourceLink(
			data.environmentName ?? '',
			data.resourceType,
			data.resourceName,
			data.teamSlug
		)}>{data.resourceName}</a
	>
	{#if data.secretValuesViewed?.reason}
		<BodyShort size="small"><em>Reason: {data.secretValuesViewed.reason}</em></BodyShort>
	{/if}

	<BodyShort textColor="subtle" size="small">
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
