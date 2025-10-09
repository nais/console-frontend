<script lang="ts">
	import { envTagVariant } from '$lib/envTagVariant';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Tag } from '@nais/ds-svelte-community';
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
		Allowed <a href="/team/{u.allowedTeamSlug}">{u.allowedTeamSlug}</a> to access the instance.
	{:else if u.revokedTeamSlug}
		Revoked access for <a href="/team/{u.revokedTeamSlug}">{u.revokedTeamSlug}</a> to the instance.
	{/if}

	{#if data.environmentName}
		<Tag size="small" variant={envTagVariant(data.environmentName)}>{data.environmentName}</Tag>
	{/if}

	<BodyShort textColor="subtle" size="small">
		By {data.actor}
		<Time time={data.createdAt} distance />
	</BodyShort>
</div>
