<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'PostgresCreatedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Postgres <strong>{data.resourceName}</strong> created
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{ ...data, activityType: 'POSTGRES_CREATED' }}
	/>
</div>
