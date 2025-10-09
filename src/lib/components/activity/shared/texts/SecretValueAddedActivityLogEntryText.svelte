<script lang="ts">
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';
	import { activityLogResourceLink } from '../../utils';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'SecretValueAddedActivityLogEntry'>;
	} = $props();
</script>

<div>
	Value
	<span class="valueName">{data.secretValueAdded.valueName}</span> was added to secret
	<a
		href={activityLogResourceLink(
			data.environmentName ?? '',
			data.resourceType,
			data.resourceName,
			data.teamSlug
		)}>{data.resourceName}</a
	>

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>

<style>
	.valueName {
		font-weight: bold;
		word-break: break-all;
	}
</style>
