<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import Meta from '../../Meta.svelte';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'TeamMemberAddedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	{data.addedData.userEmail} was added to team.
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
