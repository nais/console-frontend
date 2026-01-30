<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'SecretValuesViewedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	<strong>{data.actor}</strong> viewed secret values for <strong>{data.resourceName}</strong>
	{#if data.secretValuesViewedData?.reason}
		<br />
		<BodyShort size="small"><em>Reason: {data.secretValuesViewedData.reason}</em></BodyShort>
	{/if}
	<BodyShort textColor="subtle" size="small">
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
