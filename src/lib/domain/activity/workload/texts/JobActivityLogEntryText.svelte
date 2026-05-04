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
				return 'Job created';
			case 'JobDeletedActivityLogEntry':
				return 'Job deleted';
			case 'JobRunDeletedActivityLogEntry':
				return data.jobRunDeleted?.runName
					? `Run deleted: ${data.jobRunDeleted.runName}`
					: 'Run deleted';
			case 'JobTriggeredActivityLogEntry':
				return 'Job triggered';
			case 'JobUpdatedActivityLogEntry':
				return data.jobUpdated?.changedFields?.length
					? `Job updated: ${summarizeChangedFields(data.jobUpdated.changedFields)}`
					: 'Job updated';
		}
	});
</script>

<div>
	{summary}
	<Meta actor={data.actor} createdAt={data.createdAt} actorPrefix="by" />
</div>
