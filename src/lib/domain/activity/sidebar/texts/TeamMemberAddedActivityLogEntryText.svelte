<script lang="ts">
	import type { SidebarActivityLogEntry } from './types';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: SidebarActivityLogEntry<'TeamMemberAddedActivityLogEntry'>;
	} = $props();
</script>

<div>
	{data.addedData.userEmail} added to team by {data.actor}<br />
	<BodyShort textColor="subtle" size="small">
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
