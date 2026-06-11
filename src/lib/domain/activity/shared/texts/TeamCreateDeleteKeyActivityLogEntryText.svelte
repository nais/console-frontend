<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'TeamCreateDeleteKeyActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Created delete key for team <a href="/team/{data.teamSlug}">{data.resourceName}</a>
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'TEAM_CREATE_DELETE_KEY'
		}}
	/>
</div>
