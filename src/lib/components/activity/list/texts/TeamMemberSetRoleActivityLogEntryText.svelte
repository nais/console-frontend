<script lang="ts">
	import type { ActivityLogEntryFragment$data } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			ActivityLogEntryFragment$data,
			{ __typename: 'TeamMemberSetRoleActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	{#if data.teamMemberSetRole}
		Set role to <strong>{data.teamMemberSetRole.role}</strong> for user
		{data.teamMemberSetRole.userEmail || 'unknown email'}
	{/if}

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
