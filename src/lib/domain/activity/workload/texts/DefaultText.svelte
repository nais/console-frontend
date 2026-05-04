<script lang="ts">
	import type { WorkloadActivityEntryFragment$data } from '$houdini';

	import Meta from './Meta.svelte';

	let { data }: { data: WorkloadActivityEntryFragment$data } = $props();
</script>

<div>
	{data.message || 'Activity recorded'}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
