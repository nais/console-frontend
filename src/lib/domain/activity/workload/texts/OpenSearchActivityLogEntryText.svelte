<script lang="ts">
	import { summarizeChangedFields } from './helpers';
	import Meta from './Meta.svelte';
	import type { WorkloadActivityEntry } from './types';

	let {
		data
	}: {
		data: WorkloadActivityEntry<
			| 'OpenSearchCreatedActivityLogEntry'
			| 'OpenSearchDeletedActivityLogEntry'
			| 'OpenSearchUpdatedActivityLogEntry'
		>;
	} = $props();

	const summary = $derived.by(() => {
		switch (data.__typename) {
			case 'OpenSearchCreatedActivityLogEntry':
				return `Created OpenSearch ${data.resourceName}`;
			case 'OpenSearchDeletedActivityLogEntry':
				return `Deleted OpenSearch ${data.resourceName}`;
			case 'OpenSearchUpdatedActivityLogEntry':
				return data.opensearchData?.updatedFields?.length
					? `Updated OpenSearch ${data.resourceName}: ${summarizeChangedFields(data.opensearchData.updatedFields)}`
					: `Updated OpenSearch ${data.resourceName}`;
		}
	});
</script>

<div>
	{summary}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
