<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { SidebarActivityLogFragment$data } from '$houdini';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'UnleashInstanceDeletedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	Unleash instance <strong>{data.resourceName}</strong> deleted
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
