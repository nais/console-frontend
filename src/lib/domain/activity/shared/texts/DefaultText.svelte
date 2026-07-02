<script lang="ts">
	import type { ActivityLogEntryFragment$data } from '$houdini';
	import Meta from '../../Meta.svelte';

	import type { TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntryFragment$data;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	{data.message}

	{#if data.environmentName}
		in {data.environmentName}
	{/if}

	<Meta actor={data.actor} createdAt={data.createdAt} {mode} />
</div>
