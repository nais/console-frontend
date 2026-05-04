<script lang="ts">
	import Meta from '../../Meta.svelte';
	import { resourceTypeToText } from '$lib/domain/activity/sidebar/texts/utils';

	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'OpenSearchDeletedActivityLogEntry'>;
	} = $props();
</script>

<div>
	{resourceTypeToText(data.resourceType)}
	<strong>{data.resourceName}</strong> deleted
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.

	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
