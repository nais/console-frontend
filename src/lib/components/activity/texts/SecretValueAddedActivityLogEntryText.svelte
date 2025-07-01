<script lang="ts">
	import type { SecretActivityLogFragment$data } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			SecretActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'SecretValueAddedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	Value <strong>{data.secretValueAddedData.valueName}</strong> was added to secret
	<strong>{data.resourceName}</strong>
	by {data.actor}<br />
	<BodyShort textColor="subtle" size="small">
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
