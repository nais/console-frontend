<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import { capitalizeFirstLetter } from '$lib/utils/formatters';
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'ClusterAuditActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	<BodyLong size="small">
		{capitalizeFirstLetter(data.message.toLowerCase())}
		{#if data.environmentName}
			in {data.environmentName}
		{/if}.
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
