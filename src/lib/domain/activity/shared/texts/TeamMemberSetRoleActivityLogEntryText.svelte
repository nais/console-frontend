<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'TeamMemberSetRoleActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	{data.teamMemberSetRole.userEmail} was set to
	<strong>{data.teamMemberSetRole.role.toLocaleLowerCase()}</strong>
	<Meta actor={data.actor} createdAt={data.createdAt} {mode} />
</div>
