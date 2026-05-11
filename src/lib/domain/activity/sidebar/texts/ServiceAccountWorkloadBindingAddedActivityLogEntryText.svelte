<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'ServiceAccountWorkloadBindingAddedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	<BodyLong size="small">
		Added workload <strong>{data.workloadBindingAddedData.workloadName}</strong> to service account
		<a href="/team/{data.teamSlug}/settings/service_accounts">{data.resourceName}</a>.
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
