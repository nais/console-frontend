<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'RoleRevokedFromServiceAccountActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Role <span class="name">{data.roleRevokedFromServiceAccount.roleName}</span> revoked from service
	account <span class="name">{data.resourceName}</span>
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'SERVICE_ACCOUNT_ROLE_REVOKED'
		}}
	/>
</div>

<style>
	.name {
		font-weight: bold;
		word-break: break-all;
	}
</style>
