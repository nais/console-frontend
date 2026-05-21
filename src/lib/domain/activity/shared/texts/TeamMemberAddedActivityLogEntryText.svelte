<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'TeamMemberAddedActivityLogEntry'>;
	} = $props();
</script>

<div>
	{data.teamMemberAdded.userEmail} added to team
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
