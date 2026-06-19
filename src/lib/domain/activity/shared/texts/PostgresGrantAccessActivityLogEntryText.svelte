<script lang="ts">
	import Time from '$lib/ui/Time.svelte';
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'PostgresGrantAccessActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Granted access to {data.postgresGrantAccessData.grantee} on {data.resourceType.toLocaleLowerCase()}
	<strong>{data.resourceName}</strong>
	until <Time time={data.postgresGrantAccessData.until} dateFormat="d MMM yyyy, HH:mm" />
	{#if data.environmentName}
		in {data.environmentName}
	{/if}

	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'POSTGRES_GRANT_ACCESS'
		}}
	/>
</div>
