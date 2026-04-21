<script lang="ts">
	import type { SidebarActivityLogEntry } from './types';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: SidebarActivityLogEntry<'RepositoryAddedActivityLogEntry'>;
	} = $props();
</script>

<div>
	<strong>{data.resourceName}</strong> was authorized for deploy by {data.actor}<br />
	<BodyShort textColor="subtle" size="small">
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
