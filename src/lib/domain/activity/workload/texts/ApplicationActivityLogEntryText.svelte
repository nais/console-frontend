<script lang="ts">
	import Meta from '../../Meta.svelte';
	import { summarizeChangedFields } from './helpers';
	import type { WorkloadActivityEntry } from './types';

	let {
		data
	}: {
		data: WorkloadActivityEntry<
			| 'ApplicationCreatedActivityLogEntry'
			| 'ApplicationDeletedActivityLogEntry'
			| 'ApplicationRestartedActivityLogEntry'
			| 'ApplicationScaledActivityLogEntry'
			| 'ApplicationUpdatedActivityLogEntry'
		>;
	} = $props();

	const summary = $derived.by(() => {
		switch (data.__typename) {
			case 'ApplicationCreatedActivityLogEntry':
				return 'Created app';
			case 'ApplicationDeletedActivityLogEntry':
				return 'Deleted app';
			case 'ApplicationRestartedActivityLogEntry':
				return 'Restarted app';
			case 'ApplicationScaledActivityLogEntry': {
				const size = data.appScaled?.newSize;
				const direction = data.appScaled?.direction?.toLowerCase();
				if (size == null) {
					return 'Scaled app';
				}

				return direction ? `Scaled app ${direction} to ${size}` : `Scaled app to ${size}`;
			}
			case 'ApplicationUpdatedActivityLogEntry':
				return data.applicationUpdated?.changedFields?.length
					? `Updated app: ${summarizeChangedFields(data.applicationUpdated.changedFields)}`
					: 'Updated app';
		}
	});
</script>

<div>
	{summary}
	<Meta actor={data.actor} createdAt={data.createdAt} actorPrefix="by" />
</div>
