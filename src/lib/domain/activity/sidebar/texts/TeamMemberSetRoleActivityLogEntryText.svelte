<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import Meta from '../../Meta.svelte';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'TeamMemberSetRoleActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	{data.setRoleData.userEmail} was set to
	<strong>{data.setRoleData.role.toLocaleLowerCase()}</strong>.
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
