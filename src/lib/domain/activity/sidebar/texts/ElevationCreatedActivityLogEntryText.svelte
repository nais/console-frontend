<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'ElevationCreatedActivityLogEntry' }
		>;
	} = $props();

	const elevationTypeText = (type: string): string => {
		switch (type) {
			case 'SECRET':
				return 'secret values';
			case 'INSTANCE_EXEC':
				return 'exec';
			case 'INSTANCE_PORT_FORWARD':
				return 'port-forward';
			case 'INSTANCE_DEBUG':
				return 'debug';
			default:
				return type.toLowerCase();
		}
	};
</script>

<div>
	<strong>{data.actor}</strong> elevated access to view {elevationTypeText(
		data.elevationData.elevationType
	)} for <strong>{data.elevationData.targetResourceName}</strong><br />
	<BodyShort textColor="subtle" size="small">
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
