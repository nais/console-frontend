<script lang="ts">
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';
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
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
