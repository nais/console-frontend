<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import Meta from '../../Meta.svelte';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'TeamMemberRemovedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	{data.removedData.userEmail} was removed from team.
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
