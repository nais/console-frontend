<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'TeamDeployKeyUpdatedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Updated deploy key for team <a href="/team/{data.teamSlug}">{data.resourceName}</a>
	<Meta actor={data.actor} createdAt={data.createdAt} {mode} />
</div>
