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
				return 'App created';
			case 'ApplicationDeletedActivityLogEntry':
				return 'App deleted';
			case 'ApplicationRestartedActivityLogEntry':
				return 'App restarted';
			case 'ApplicationScaledActivityLogEntry': {
				const size = data.appScaled?.newSize;
				const direction = data.appScaled?.direction?.toLowerCase();
				if (size == null) {
					return 'App scaled';
				}

				return direction ? `App scaled ${direction} to ${size}` : `App scaled to ${size}`;
			}
			case 'ApplicationUpdatedActivityLogEntry':
				return data.applicationUpdated?.changedFields?.length
					? `App updated: ${summarizeChangedFields(data.applicationUpdated.changedFields)}`
					: 'App updated';
		}
	});
</script>

<div>
	{summary}
	<Meta actor={data.actor} createdAt={data.createdAt} actorPrefix="by" />
</div>
