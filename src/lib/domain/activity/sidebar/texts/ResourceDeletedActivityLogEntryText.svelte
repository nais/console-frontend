<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';
	import { resourceTypeToText } from './utils';

	let {
		data
	}: {
		data: SidebarActivityLogFragment$data['activityLog']['nodes'][number];
	} = $props();
</script>

<div>
	{resourceTypeToText(data.resourceType)}
	<strong>{data.resourceName}</strong> deleted
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.
	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
