<script lang="ts">
	import type { TeamActivityLogFragment$data } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			TeamActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'TeamMemberSetRoleActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	{data.setRoleData.userEmail} was set to
	<strong>{data.setRoleData.role.toLocaleLowerCase()}</strong> by {data.actor}<br />
	<BodyShort textColor="subtle" size="small">
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
