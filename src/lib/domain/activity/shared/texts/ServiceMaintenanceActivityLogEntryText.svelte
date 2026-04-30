<script lang="ts">
	import { resourceTypeToText } from '$lib/domain/activity/sidebar/texts/utils';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';
	import { activityLogResourceLink } from '../../utils';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'ServiceMaintenanceActivityLogEntry'>;
	} = $props();

	const link = $derived(
		data.environmentName
			? activityLogResourceLink(
					data.environmentName,
					data.resourceType,
					data.resourceName,
					data.teamSlug
				)
			: null
	);
</script>

<div>
	Started maintenance on {resourceTypeToText(data.resourceType)}
	{#if link}
		<a href={link}><strong>{data.resourceName}</strong></a>
	{:else}
		<strong>{data.resourceName}</strong>
	{/if}

	{#if data.environmentName}
		in {data.environmentName}
	{/if}

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
