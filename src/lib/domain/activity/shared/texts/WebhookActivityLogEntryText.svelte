<script lang="ts">
	import { ReadMore } from '#lib/shadcn/ui/index.js';
	import Meta from '../../Meta.svelte';
	import type { ActivityLogEntry, TimelineModes } from './types';

	const operations = {
		WebhookCreatedActivityLogEntry: { label: 'created', activityType: 'WEBHOOK_CREATED' },
		WebhookDeletedActivityLogEntry: { label: 'deleted', activityType: 'WEBHOOK_DELETED' },
		WebhookUpdatedActivityLogEntry: { label: 'updated', activityType: 'WEBHOOK_UPDATED' }
	} as const;

	type WebhookEntry = (
		| ActivityLogEntry<'WebhookCreatedActivityLogEntry'>
		| ActivityLogEntry<'WebhookDeletedActivityLogEntry'>
		| ActivityLogEntry<'WebhookUpdatedActivityLogEntry'>
	) & { __typename: keyof typeof operations };

	let { data, mode = 'full' }: { data: WebhookEntry; mode?: TimelineModes } = $props();

	const operation = $derived(operations[data.__typename]);
	const name = $derived('webhookUpdated' in data ? data.webhookUpdated.name : data.webhook.name);
	const updatedFields = $derived('webhookUpdated' in data ? data.webhookUpdated.updatedFields : []);
</script>

<div>
	Webhook <strong>{name}</strong>
	{operation.label}.
	{#if mode === 'full' && updatedFields.length > 0}
		<ReadMore header="Updated fields" size="small">
			<dl class="settings-list">
				{#each updatedFields as field (field.field)}
					<dt><code>{field.field}</code></dt>
					<dd>
						{#if field.oldValue !== null && field.newValue !== null}
							<code>{field.oldValue}</code> -> <code>{field.newValue}</code>
						{:else if field.newValue !== null}
							set to <code>{field.newValue}</code>
						{:else if field.oldValue !== null}
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
		link={{ ...data, activityType: operation.activityType }}
	/>
</div>
