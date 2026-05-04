<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { SidebarActivityLogFragment$data } from '$houdini';

	let {
		data
	}: {
		data: SidebarActivityLogFragment$data['activityLog']['nodes'][number];
	} = $props();
</script>

<div>
	{data.message}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
