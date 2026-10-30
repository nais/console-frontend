<script lang="ts">
	import { ReadMore } from '#lib/shadcn/ui/index.js';
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
		<ReadMore header="Updated fields" size="small">
			<dl class="updated-fields">
				{#each data.postgresUpdated.updatedFields as field (field)}
					<dt><code>{field.field}</code></dt>
					<dd>
						{#if field.oldValue && field.newValue}
							<code>{field.oldValue}</code> -> <code>{field.newValue}</code>
						{:else if !field.oldValue && field.newValue}
							set to <code>{field.newValue}</code>
						{:else if field.oldValue && !field.newValue}
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

<style>
	.updated-fields {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		gap: var(--ax-space-8);
		margin: var(--ax-space-8) 0;
	}
	dt {
		font-weight: var(--ax-font-weight-bold);
	}
	dd {
		margin: 0;
		min-width: 0;
		overflow-wrap: anywhere;
	}
	code {
		font-family: monospace;
		font-size: var(--ax-font-size-small);
	}
	@media (max-width: 767px) {
		.updated-fields {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
