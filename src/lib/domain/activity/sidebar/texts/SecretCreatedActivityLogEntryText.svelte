<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'SecretCreatedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	Secret <strong>{data.resourceName}</strong> created by {data.actor}<br />
	<BodyShort textColor="subtle" size="small">
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
