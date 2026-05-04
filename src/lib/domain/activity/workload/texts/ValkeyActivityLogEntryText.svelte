<script lang="ts">
	import { summarizeChangedFields } from './helpers';
	import Meta from './Meta.svelte';
	import type { WorkloadActivityEntry } from './types';

	let {
		data
	}: {
		data: WorkloadActivityEntry<
			| 'ValkeyCreatedActivityLogEntry'
			| 'ValkeyDeletedActivityLogEntry'
			| 'ValkeyUpdatedActivityLogEntry'
		>;
	} = $props();

	const summary = $derived.by(() => {
		switch (data.__typename) {
			case 'ValkeyCreatedActivityLogEntry':
				return `Created Valkey ${data.resourceName}`;
			case 'ValkeyDeletedActivityLogEntry':
				return `Deleted Valkey ${data.resourceName}`;
			case 'ValkeyUpdatedActivityLogEntry':
				return data.valkeyData?.updatedFields?.length
					? `Updated Valkey ${data.resourceName}: ${summarizeChangedFields(data.valkeyData.updatedFields)}`
					: `Updated Valkey ${data.resourceName}`;
		}
	});
</script>

<div>
	{summary}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
