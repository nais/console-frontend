<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import Meta from '../../Meta.svelte';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'RepositoryAddedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	<strong>{data.resourceName}</strong> was authorized for deploy.
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
