<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';

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
	<BodyLong size="small">
		Unleash instance <a href="/team/{data.teamSlug}/unleash">{data.resourceName}</a> created.
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
