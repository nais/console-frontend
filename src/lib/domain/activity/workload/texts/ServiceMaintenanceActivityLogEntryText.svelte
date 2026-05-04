<script lang="ts">
	import { resourceTypeToText } from '$lib/domain/activity/sidebar/texts/utils';

	import Meta from './Meta.svelte';
	import type { WorkloadActivityEntry } from './types';

	let {
		data
	}: {
		data: WorkloadActivityEntry<'ServiceMaintenanceActivityLogEntry'>;
	} = $props();
</script>

<div>
	Started maintenance on {resourceTypeToText(data.resourceType)}
	{data.resourceName}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
