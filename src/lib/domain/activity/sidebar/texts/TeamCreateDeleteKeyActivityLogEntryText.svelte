<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'TeamCreateDeleteKeyActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	<BodyLong size="small">
		Created delete key for team <strong>{data.resourceName}</strong>.
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
