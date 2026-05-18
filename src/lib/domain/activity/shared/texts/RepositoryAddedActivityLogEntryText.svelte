<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'RepositoryAddedActivityLogEntry'>;
	} = $props();
</script>

<div>
	<strong>{data.resourceName}</strong> was authorized for deploy
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
