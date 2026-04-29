<script lang="ts">
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';
	import type { ActivityLogEntry } from './types';

	let {
		data
	}: {
		data: ActivityLogEntry<'UnleashInstanceUpdatedActivityLogEntry'>;
	} = $props();

	const u = $derived(data.unleashInstanceUpdated);
</script>

<div>
	{data.message}
	{#if u.allowedTeamSlug}
		Allowed <a href="/team/{u.allowedTeamSlug}">{u.allowedTeamSlug}</a> to access the instance
		{#if data.environmentName}
			in {data.environmentName}
		{/if}.
	{:else if u.revokedTeamSlug}
		Revoked access for <a href="/team/{u.revokedTeamSlug}">{u.revokedTeamSlug}</a> to the instance
		{#if data.environmentName}
			in {data.environmentName}
		{/if}.
	{:else if u.updatedReleaseChannel}
		Changed release channel to <strong>{u.updatedReleaseChannel}</strong>
		{#if data.environmentName}
			in {data.environmentName}
		{/if}.
	{/if}

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
