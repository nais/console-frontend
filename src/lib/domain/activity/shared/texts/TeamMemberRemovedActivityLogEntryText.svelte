<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'TeamMemberRemovedActivityLogEntry'>;
	} = $props();
</script>

<div>
	{data.teamMemberRemoved.userEmail} was removed from team
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
