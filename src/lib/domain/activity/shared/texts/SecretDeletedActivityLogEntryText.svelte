<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'SecretDeletedActivityLogEntry'>;
	} = $props();
</script>

<div>
	Secret <strong>{data.resourceName}</strong> was deleted
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
