<script lang="ts">
	import Meta from '../../Meta.svelte';
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import Time from '$lib/ui/Time.svelte';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'PostgresGrantAccessActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	Granted access to <strong>{data.postgresGrantAccessData.grantee}</strong> on postgres
	<strong>{data.resourceName}</strong>
	until <Time time={data.postgresGrantAccessData.until} dateFormat="dd/MM/yyyy HH:mm" />
	{#if data.environmentName}
		in {data.environmentName}
	{/if}
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
