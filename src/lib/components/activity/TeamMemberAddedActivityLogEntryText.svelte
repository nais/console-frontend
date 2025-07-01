<script lang="ts">
	import type { TeamActivityLogFragment$data } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			TeamActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'TeamMemberAddedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	{data.addedData.userEmail} added to team by {data.actor}<br />
	<BodyShort textColor="subtle" size="small">
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
