<script lang="ts">
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';
	import { activityLogResourceLink } from '../../utils';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'JobRunDeletedActivityLogEntry'>;
	} = $props();
</script>

<div>
	Job run <strong>{data.jobRunDeletedData?.runName}</strong> from job
	<a
		href={activityLogResourceLink(
			data.environmentName ?? '',
			data.resourceType,
			data.resourceName,
			data.teamSlug
		)}>{data.resourceName}</a
	>
	deleted

	{#if data.environmentName}
		in <Tag size="small" variant={envTagVariant(data.environmentName)}>{data.environmentName}</Tag>
	{/if}

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
