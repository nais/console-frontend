<script lang="ts">
	import Meta from './Meta.svelte';
	import { summarizeChangedFields } from './helpers';
	import type { WorkloadActivityEntry } from './types';

	let {
		data
	}: {
		data: WorkloadActivityEntry<'GenericKubernetesResourceActivityLogEntry'>;
	} = $props();

	const kind = $derived(data.genericKubernetesData?.kind?.toLowerCase() ?? 'resource');
	const summary = $derived(
		data.genericKubernetesData?.changedFields?.length
			? `Updated ${kind} ${data.resourceName}: ${summarizeChangedFields(data.genericKubernetesData.changedFields)}`
			: `Updated ${kind} ${data.resourceName}`
	);
</script>

<div>
	{summary}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
