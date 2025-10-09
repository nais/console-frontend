<script lang="ts">
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'RepositoryRemovedActivityLogEntry'>;
	} = $props();
</script>

<div>
	<strong>{data.resourceName}</strong> was deauthorized for deploy
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
