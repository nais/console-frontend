<script lang="ts">
	import { BodyLong } from '@nais/ds-svelte-community';
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
	<BodyLong size="small">
		{data.setRoleData.userEmail} was set to
		<strong>{data.setRoleData.role.toLocaleLowerCase()}</strong>.
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
