<script lang="ts">
	import type { SidebarActivityLogFragment$data } from '$houdini';
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'ServiceAccountTokenCreatedActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	<BodyLong size="small">
		Token <strong>{data.serviceAccountTokenCreatedData.tokenName}</strong> created for service
		account <a href="/team/{data.teamSlug}/settings/service_accounts">{data.resourceName}</a>.
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
