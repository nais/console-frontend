<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'UnleashInstanceDeletedActivityLogEntry'>;
	} = $props();
</script>

<div>
	Unleash instance <strong>{data.resourceName}</strong> deleted
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
