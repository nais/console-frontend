<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import Time from '$lib/ui/Time.svelte';
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';

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
	<BodyLong size="small">
		Granted access to <strong>{data.postgresGrantAccessData.grantee}</strong> on postgres
		<strong>{data.resourceName}</strong>
		until <Time time={data.postgresGrantAccessData.until} dateFormat="dd/MM/yyyy HH:mm" />
		{#if data.environmentName}
			in {data.environmentName}
		{/if}.
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
