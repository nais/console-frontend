<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'TeamCreatedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	Team <strong>{data.resourceName}</strong> created
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
