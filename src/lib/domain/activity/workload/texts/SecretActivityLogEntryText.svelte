<script lang="ts">
	import Meta from './Meta.svelte';
	import type { WorkloadActivityEntry } from './types';

	let {
		data
	}: {
		data: WorkloadActivityEntry<
			| 'SecretCreatedActivityLogEntry'
			| 'SecretDeletedActivityLogEntry'
			| 'SecretValueAddedActivityLogEntry'
			| 'SecretValueRemovedActivityLogEntry'
			| 'SecretValueUpdatedActivityLogEntry'
			| 'SecretValuesViewedActivityLogEntry'
		>;
	} = $props();

	const summary = $derived.by(() => {
		switch (data.__typename) {
			case 'SecretCreatedActivityLogEntry':
				return `Created secret ${data.resourceName}`;
			case 'SecretDeletedActivityLogEntry':
				return `Deleted secret ${data.resourceName}`;
			case 'SecretValueAddedActivityLogEntry':
				return data.secretValueAdded?.valueName
					? `Added value ${data.secretValueAdded.valueName} in ${data.resourceName}`
					: `Added value in ${data.resourceName}`;
			case 'SecretValueRemovedActivityLogEntry':
				return data.secretValueRemoved?.valueName
					? `Removed value ${data.secretValueRemoved.valueName} from ${data.resourceName}`
					: `Removed value from ${data.resourceName}`;
			case 'SecretValueUpdatedActivityLogEntry':
				return data.secretValueUpdated?.valueName
					? `Updated value ${data.secretValueUpdated.valueName} in ${data.resourceName}`
					: `Updated value in ${data.resourceName}`;
			case 'SecretValuesViewedActivityLogEntry':
				return `Viewed values in ${data.resourceName}`;
		}
	});
</script>

<div>
	{summary}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
