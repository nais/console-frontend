<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'SecretValueUpdatedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	Value <strong>{data.secretValueUpdatedData.valueName}</strong> updated in secret
	<strong>{data.resourceName}</strong>
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
