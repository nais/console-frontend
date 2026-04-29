<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import Time from '$lib/ui/Time.svelte';
	import { capitalizeFirstLetter } from '$lib/utils/formatters';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'ClusterAuditActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	{capitalizeFirstLetter(data.message.toLowerCase())}
	in {data.environmentName}

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
