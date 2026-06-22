<script lang="ts">
	import { ActivityLogEntryFragment$data } from '$houdini';
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
	Postgres instance <strong>{data.resourceName}</strong> was deleted

	{#if data.environmentName}
		in {data.environmentName}
	{/if}

	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'POSTGRES_DELETED'
		}}
	/>
</div>
