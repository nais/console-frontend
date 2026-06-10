<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'TeamMemberRemovedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	{data.teamMemberRemoved.userEmail} was removed from team
	<Meta actor={data.actor} createdAt={data.createdAt} {mode} />
</div>
