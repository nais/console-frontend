<script lang="ts">
	import { BodyLong } from '@nais/ds-svelte-community';
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
	<BodyLong size="small">
		{data.addedData.userEmail} was added to team.
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
