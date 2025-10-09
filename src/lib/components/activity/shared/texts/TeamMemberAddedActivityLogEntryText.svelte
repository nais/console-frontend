<script lang="ts">
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'TeamMemberAddedActivityLogEntry'>;
	} = $props();
</script>

<div>
	{data.teamMemberAdded.userEmail} added to team
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
