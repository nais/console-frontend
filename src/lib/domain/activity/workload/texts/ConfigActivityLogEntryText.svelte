<script lang="ts">
	import Meta from './Meta.svelte';
	import { summarizeChangedFields } from './helpers';
	import type { WorkloadActivityEntry } from './types';

	let {
		data
	}: {
		data: WorkloadActivityEntry<
			| 'ConfigCreatedActivityLogEntry'
			| 'ConfigDeletedActivityLogEntry'
			| 'ConfigUpdatedActivityLogEntry'
		>;
	} = $props();

	const summary = $derived.by(() => {
		switch (data.__typename) {
			case 'ConfigCreatedActivityLogEntry':
				return `Created config ${data.resourceName}`;
			case 'ConfigDeletedActivityLogEntry':
				return `Deleted config ${data.resourceName}`;
			case 'ConfigUpdatedActivityLogEntry':
				return data.configUpdated?.updatedFields?.length
					? `Updated config ${data.resourceName}: ${summarizeChangedFields(data.configUpdated.updatedFields)}`
					: `Updated config ${data.resourceName}`;
		}
	});
</script>

<div>
	{summary}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
