<script lang="ts">
	import type { ActivityLogEntryFragment$data } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<ActivityLogEntryFragment$data, { __typename: 'TeamMemberAddedActivityLogEntry' }>;
	} = $props();
</script>

<div>
	{#if data.teamMemberAdded}
		Added member <strong>{data.teamMemberAdded.userEmail || 'unknown email'}</strong> to team as
		<strong>{data.teamMemberAdded.role}</strong>
	{/if}

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
