<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'RepositoryAddedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	<strong>{data.resourceName}</strong> was authorized for deploy
	<Meta actor={data.actor} createdAt={data.createdAt} {mode} />
</div>
