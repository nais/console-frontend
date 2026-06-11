<script lang="ts">
	import Meta from '../../Meta.svelte';

	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'UnleashInstanceUpdatedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();

	const u = $derived(data.unleashInstanceUpdated);
	const environmentSuffix = $derived(data.environmentName ? ` in ${data.environmentName}` : '');
</script>

<div>
	{data.message}
	{#if u.allowedTeamSlug}
		Allowed <a href="/team/{u.allowedTeamSlug}">{u.allowedTeamSlug}</a> to access the instance{environmentSuffix}.
	{:else if u.revokedTeamSlug}
		Revoked access for <a href="/team/{u.revokedTeamSlug}">{u.revokedTeamSlug}</a> to the instance{environmentSuffix}.
	{:else if u.updatedReleaseChannel}
		Changed release channel to <strong>{u.updatedReleaseChannel}</strong>{environmentSuffix}.
	{:else}
		{environmentSuffix}.
	{/if}

	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{
			...data,
			activityType: 'UNLEASH_INSTANCE_UPDATED'
		}}
	/>
</div>
