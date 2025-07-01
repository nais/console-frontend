<script lang="ts">
	import type { SecretActivityLogFragment$data } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			SecretActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'SecretValueRemovedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	Value <strong>{data.secretValueRemoved.valueName}</strong> in secret
	<strong>{data.resourceName}</strong> was removed by {data.actor}<br />
	<BodyShort textColor="subtle" size="small">
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
