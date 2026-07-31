<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'RoleAssignedToServiceAccountActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Role <span class="name">{data.roleAssignedToServiceAccount.roleName}</span> assigned to service
	account <span class="name">{data.resourceName}</span>
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'SERVICE_ACCOUNT_ROLE_ASSIGNED'
		}}
	/>
</div>

<style>
	.name {
		font-weight: bold;
		word-break: break-all;
	}
</style>
