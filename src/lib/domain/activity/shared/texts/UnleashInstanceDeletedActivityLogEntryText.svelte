<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'UnleashInstanceDeletedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Unleash instance <strong>{data.resourceName}</strong> deleted
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'UNLEASH_INSTANCE_DELETED'
		}}
	/>
</div>
