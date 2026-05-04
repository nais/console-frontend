<script lang="ts">
	import Meta from './Meta.svelte';
	import type { WorkloadActivityEntry } from './types';

	let {
		data
	}: {
		data: WorkloadActivityEntry<'ClusterAuditActivityLogEntry'>;
	} = $props();

	const action = $derived(
		data.clusterAuditData?.action?.toLowerCase().replaceAll('_', ' ') ?? 'updated'
	);
	const resourceKind = $derived(data.clusterAuditData?.resourceKind?.toLowerCase() ?? 'resource');
</script>

<div>
	{action.charAt(0).toUpperCase() + action.slice(1)}
	{resourceKind} via Kubernetes audit
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
