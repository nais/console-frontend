<script lang="ts">
	import type { WorkloadActivityLogFragment$data } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: WorkloadActivityLogFragment$data['activityLog']['nodes'][number];
	} = $props();
</script>

<div>
	{data.message}<br />
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
