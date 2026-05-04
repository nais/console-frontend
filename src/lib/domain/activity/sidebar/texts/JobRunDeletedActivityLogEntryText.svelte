<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { SidebarActivityLogFragment$data } from '$houdini';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'JobRunDeletedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	Job run <strong>{data.jobRunDeletedData?.runName}</strong> from job
	<strong>{data.resourceName}</strong>
	deleted
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
