<script lang="ts">
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'ConfigDeletedActivityLogEntry'>;
	} = $props();
</script>

<div>
	Config <strong>{data.resourceName}</strong> deleted
	{#if data.environmentName}
		in {data.environmentName}
	{/if}
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
