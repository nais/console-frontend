<script lang="ts">
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';
	import type { SidebarActivityLogEntryAny } from './types';

	let {
		data
	}: {
		data: SidebarActivityLogEntryAny;
	} = $props();
</script>

<div>
	{data.message}
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
