<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'RepositoryRemovedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	<strong>{data.resourceName}</strong> was deauthorized for deploy
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'REPOSITORY_REMOVED'
		}}
	/>
</div>
