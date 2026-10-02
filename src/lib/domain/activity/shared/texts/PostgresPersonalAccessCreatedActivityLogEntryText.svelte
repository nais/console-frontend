<script lang="ts">
	import Time from '#lib/ui/Time.svelte';
	import Meta from '../../Meta.svelte';
	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode = 'full'
	}: {
		data: ActivityLogEntry<'PostgresPersonalAccessCreatedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Personal Postgres access granted to {data.postgresPersonalAccessCreated.username}
	on <strong>{data.resourceName}</strong>
	{#if data.postgresPersonalAccessCreated.accessLevel}
		({data.postgresPersonalAccessCreated.accessLevel})
	{/if}
	until <Time time={data.postgresPersonalAccessCreated.expiresAt} dateFormat="d MMM yyyy, HH:mm" />
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.
	{#if mode === 'full' && data.postgresPersonalAccessCreated.reason}
		<p>Reason: {data.postgresPersonalAccessCreated.reason}</p>
	{/if}
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{ ...data, activityType: 'POSTGRES_PERSONAL_ACCESS_CREATED' }}
	/>
</div>
