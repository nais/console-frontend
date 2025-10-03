<script lang="ts">
	import type { TeamOverviewActivityLog$result } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			TeamOverviewActivityLog$result['team']['activityLog']['edges'][number]['node'],
			{ __typename: 'TeamMemberAddedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	{data.teamMemberAdded.userEmail} added to team
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
