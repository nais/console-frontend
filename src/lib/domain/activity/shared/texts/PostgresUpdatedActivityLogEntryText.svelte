<script lang="ts">
	import { ReadMore } from '@nais/ds-svelte-community';
	import Meta from '../../Meta.svelte';
	import type { ActivityLogEntry, TimelineModes } from './types';

	let {
		data,
		mode
	}: {
		data: ActivityLogEntry<'PostgresUpdatedActivityLogEntry'>;
		mode?: TimelineModes;
	} = $props();
</script>

<div>
	Postgres <strong>{data.resourceName}</strong> updated
	{#if data.environmentName}
		in {data.environmentName}
	{/if}.
	{#if mode === 'full' && data.postgresUpdated.updatedFields.length > 0}
		<ReadMore header="Updated fields">
			<dl class="settings-list">
				{#each data.postgresUpdated.updatedFields as field (field)}
					<dt><code>{field.field}</code></dt>
					<dd>
						{#if field.oldValue != null && field.newValue != null}
							<code>{field.oldValue}</code> -> <code>{field.newValue}</code>
						{:else if field.oldValue == null && field.newValue != null}
							set to <code>{field.newValue}</code>
						{:else if field.oldValue != null && field.newValue == null}
							removed (was <code>{field.oldValue}</code>)
						{:else}
							changed
						{/if}
					</dd>
				{/each}
			</dl>
		</ReadMore>
	{/if}
	<Meta
		actor={data.actor}
		createdAt={data.createdAt}
		{mode}
		link={{ ...data, activityType: 'POSTGRES_UPDATED' }}
	/>
</div>
