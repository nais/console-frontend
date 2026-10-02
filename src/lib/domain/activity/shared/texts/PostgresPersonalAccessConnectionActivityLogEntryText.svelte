<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'PostgresPersonalAccessConnectionActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Connection details retrieved for personal Postgres access <strong>{data.resourceName}</strong>
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{ ...data, activityType: 'POSTGRES_PERSONAL_ACCESS_CONNECTION' }}
	/>
</div>
