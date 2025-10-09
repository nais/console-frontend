<script lang="ts">
	import type { ActivityLogEntryFragment$data } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			ActivityLogEntryFragment$data,
			{ __typename: 'TeamMemberRemovedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	{#if data.teamMemberRemoved}
		Removed <strong>{data.teamMemberRemoved.userEmail || 'unknown email'}</strong> from team
	{/if}

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
