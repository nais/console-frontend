<script lang="ts">
	import type { RepositoryActivityLogFragment$data } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			RepositoryActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'RepositoryAddedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	<strong>{data.resourceName}</strong> was authorized for deploy by {data.actor}<br />
	<BodyShort textColor="subtle" size="small">
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
