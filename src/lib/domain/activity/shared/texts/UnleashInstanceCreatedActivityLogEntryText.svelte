<script lang="ts">
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'UnleashInstanceCreatedActivityLogEntry'>;
	} = $props();
</script>

<div>
	Unleash instance <a href="/team/{data.teamSlug}/unleash">{data.resourceName}</a> created
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
