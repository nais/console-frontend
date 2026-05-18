<script lang="ts">
	import { BodyLong } from '@nais/ds-svelte-community';
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
	<BodyLong size="small">
		{data.removedData.userEmail} was removed from team.
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
