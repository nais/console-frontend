<script lang="ts">
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';
	import type { SidebarActivityLogFragment$data } from '$houdini';

	let {
		data
	}: {
		data: SidebarActivityLogFragment$data['activityLog']['nodes'][number];
	} = $props();
</script>

<div>
	<BodyLong size="small">
		{data.message}
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
