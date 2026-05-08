<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { WorkloadActivityEntry } from './types';

	let { data }: { data: WorkloadActivityEntry } = $props();
</script>

<div>
	{data.message || 'Activity recorded'}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
