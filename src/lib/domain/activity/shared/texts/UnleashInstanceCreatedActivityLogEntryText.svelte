<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'UnleashInstanceCreatedActivityLogEntry'>;
	} = $props();
</script>

<div>
	Unleash instance <a href="/team/{data.teamSlug}/unleash">{data.resourceName}</a> created
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
