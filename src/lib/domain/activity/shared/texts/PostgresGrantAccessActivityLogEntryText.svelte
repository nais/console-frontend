<script lang="ts">
	import Meta from '../../Meta.svelte';
	import Time from '$lib/ui/Time.svelte';

	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'PostgresGrantAccessActivityLogEntry'>;
	} = $props();
</script>

<div>
	Granted access to {data.postgresGrantAccessData.grantee} on {data.resourceType.toLocaleLowerCase()}
	<strong>{data.resourceName}</strong>
	until <Time time={data.postgresGrantAccessData.until} dateFormat="dd/MM/yyyy HH:mm" />
	{#if data.environmentName}
		in {data.environmentName}
	{/if}

	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
