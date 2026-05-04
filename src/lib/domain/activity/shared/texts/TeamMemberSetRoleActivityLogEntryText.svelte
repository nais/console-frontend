<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'TeamMemberSetRoleActivityLogEntry'>;
	} = $props();
</script>

<div>
	{data.teamMemberSetRole.userEmail} was set to
	<strong>{data.teamMemberSetRole.role.toLocaleLowerCase()}</strong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
