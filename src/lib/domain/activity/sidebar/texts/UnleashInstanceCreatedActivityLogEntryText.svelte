<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { SidebarActivityLogFragment$data } from '$houdini';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'UnleashInstanceCreatedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	Unleash instance <strong>{data.resourceName}</strong> created
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
