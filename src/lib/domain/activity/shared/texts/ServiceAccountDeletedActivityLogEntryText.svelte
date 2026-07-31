<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'ServiceAccountDeletedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Service account <span class="name">{data.resourceName}</span> deleted
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'SERVICE_ACCOUNT_DELETED'
		}}
	/>
</div>

<style>
	.name {
		font-weight: bold;
		word-break: break-all;
	}
</style>
