<script lang="ts">
	import Meta from '../../Meta.svelte';
	import { summarizeChangedFields } from './helpers';
	import type { WorkloadActivityEntry } from './types';

	let {
		data
	}: {
		data: WorkloadActivityEntry<
			| 'JobCreatedActivityLogEntry'
			| 'JobDeletedActivityLogEntry'
			| 'JobRunDeletedActivityLogEntry'
			| 'JobTriggeredActivityLogEntry'
			| 'JobUpdatedActivityLogEntry'
		>;
	} = $props();

	const summary = $derived.by(() => {
		switch (data.__typename) {
			case 'JobCreatedActivityLogEntry':
				return 'Created job';
			case 'JobDeletedActivityLogEntry':
				return 'Deleted job';
			case 'JobRunDeletedActivityLogEntry':
				return data.jobRunDeleted?.runName
					? `Deleted run ${data.jobRunDeleted.runName}`
					: 'Deleted run';
			case 'JobTriggeredActivityLogEntry':
				return 'Triggered job';
			case 'JobUpdatedActivityLogEntry':
				return data.jobUpdated?.changedFields?.length
					? `Updated job: ${summarizeChangedFields(data.jobUpdated.changedFields)}`
					: 'Updated job';
		}
	});
</script>

<div>
	{summary}
	<Meta actor={data.actor} createdAt={data.createdAt} actorPrefix="by" />
</div>
