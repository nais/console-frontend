<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'TeamMemberAddedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	{data.teamMemberAdded.userEmail} added to team
	<Meta actor={data.actor} createdAt={data.createdAt} {mode} />
</div>
