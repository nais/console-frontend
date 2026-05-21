<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'TeamCreateDeleteKeyActivityLogEntry'>;
	} = $props();
</script>

<div>
	Created delete key for team <a href="/team/{data.teamSlug}">{data.resourceName}</a>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
