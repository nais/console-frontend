<script lang="ts">
	import type { TeamOverviewActivityLog$result } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			TeamOverviewActivityLog$result['team']['activityLog']['edges'][number]['node'],
			{ __typename: 'SecretValueAddedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	Value
	<span class="valueName">{data.secretValueAdded.valueName}</span> was added to secret
	<strong>{data.resourceName}</strong>

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>

<style>
	.valueName {
		font-weight: bold;
		word-break: break-all;
	}
</style>
