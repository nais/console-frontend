<script lang="ts">
	import { BodyLong } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';
	import type { SidebarActivityLogFragment$data } from '$houdini';

	let {
		data
	}: {
		data: Extract<
			SidebarActivityLogFragment$data['activityLog']['nodes'][number],
			{ __typename: 'RoleRevokedFromServiceAccountActivityLogEntry' }
		>;
	} = $props();
</script>

<div>
	<BodyLong size="small">
		Role <strong>{data.roleRevokedData.roleName}</strong> revoked from service account
		<strong>{data.resourceName}</strong>.
	</BodyLong>
	<Meta actor={data.actor} createdAt={data.createdAt} />
</div>
