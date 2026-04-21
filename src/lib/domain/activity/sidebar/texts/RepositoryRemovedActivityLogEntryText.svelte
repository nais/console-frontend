<script lang="ts">
	import type { SidebarActivityLogEntry } from './types';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: SidebarActivityLogEntry<'RepositoryRemovedActivityLogEntry'>;
	} = $props();
</script>

<div>
	<strong>{data.resourceName}</strong> was deauthorized for deploy by {data.actor}<br />
	<BodyShort textColor="subtle" size="small">
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
