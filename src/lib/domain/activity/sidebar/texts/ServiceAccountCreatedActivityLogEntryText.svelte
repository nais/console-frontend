<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'ServiceAccountCreatedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	<BodyLong size="small">
		Service account <strong>{data.resourceName}</strong> created.
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
