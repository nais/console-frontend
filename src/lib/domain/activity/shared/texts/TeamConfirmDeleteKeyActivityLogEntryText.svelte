<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'TeamConfirmDeleteKeyActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Confirmed delete key for team <a href="/team/{data.teamSlug}">{data.resourceName}</a>
	<Meta actor={data.actor} createdAt={data.createdAt} {mode} />
</div>
