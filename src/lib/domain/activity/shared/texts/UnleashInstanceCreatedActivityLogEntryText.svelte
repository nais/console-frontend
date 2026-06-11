<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'UnleashInstanceCreatedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Unleash instance <a href="/team/{data.teamSlug}/unleash">{data.resourceName}</a> created
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'UNLEASH_INSTANCE_CREATED'
		}}
	/>
</div>
