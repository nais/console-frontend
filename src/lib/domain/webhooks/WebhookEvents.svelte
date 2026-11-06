<script lang="ts">
	import { Accordion, AccordionItem, BodyShort, Tag } from '#lib/shadcn/ui/index.js';
	import { formatWebhookEventName } from './webhooks.js';

	let {
		eventTypes,
		metadata
	}: {
		eventTypes: readonly string[];
		metadata: readonly { type: string; group: string }[];
	} = $props();

	const groups = $derived.by(() => {
		const byType = Object.fromEntries(metadata.map((event) => [event.type, event.group]));
		const grouped: Record<string, string[]> = {};
		for (const type of eventTypes) {
			(grouped[byType[type] ?? 'Other events'] ??= []).push(type);
		}
		return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
	});
</script>

{#if eventTypes.includes('*')}
	<BodyShort>All events</BodyShort>
{:else if eventTypes.length === 0}
	<BodyShort>No events selected.</BodyShort>
{:else}
	<Accordion>
		{#each groups as [group, events] (group)}
			<AccordionItem>
				{#snippet heading()}
					<span class="group-heading">
						<span>{group}</span>
						<Tag size="small" variant="neutral">{events.length}</Tag>
					</span>
				{/snippet}
				<ul>
					{#each events as type (type)}
						<li>{formatWebhookEventName(type)}</li>
					{/each}
				</ul>
			</AccordionItem>
		{/each}
	</Accordion>
{/if}

<style>
	.group-heading {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-8);
	}

	ul {
		display: grid;
		gap: var(--ax-space-8);
		margin: 0;
		padding-left: var(--ax-space-24);
		font-size: var(--ax-font-size-small);
	}
</style>
