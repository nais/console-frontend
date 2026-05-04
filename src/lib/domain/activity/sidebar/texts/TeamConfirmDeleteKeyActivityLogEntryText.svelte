<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { SidebarActivityLogFragment$data } from '$houdini';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'TeamConfirmDeleteKeyActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	Confirmed delete key for team <strong>{data.resourceName}</strong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
