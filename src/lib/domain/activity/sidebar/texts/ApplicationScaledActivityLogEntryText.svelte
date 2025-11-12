<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'ApplicationScaledActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	Workload scaled {data.appScaled.direction} to {data.appScaled.newSize} replicas.

	<BodyShort textColor="subtle" size="small">
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
