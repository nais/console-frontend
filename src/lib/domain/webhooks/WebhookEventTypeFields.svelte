<script lang="ts">
	import type { WebhookEventTypes$result } from '$houdini';
	import { Checkbox, Radio, RadioGroup } from '#lib/shadcn/ui/index.js';
	import { formatWebhookEventName } from './webhooks.js';
	import { untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	type EventType = WebhookEventTypes$result['webhookEventTypes'][number];

	let {
		eventTypes,
		initialScope = 'all',
		initialSelected = []
	}: {
		eventTypes: readonly EventType[];
		initialScope?: 'all' | 'selected';
		initialSelected?: readonly string[];
	} = $props();

	const uid = $props.id();
	const selected = new SvelteSet(untrack(() => initialSelected));
	const groups = $derived.by(() => {
		const grouped: Record<string, EventType[]> = {};
		for (const event of eventTypes) {
			(grouped[event.group] ??= []).push(event);
		}
		return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
	});

	function toggle(type: string, checked: boolean) {
		if (checked) {
			selected.add(type);
		} else {
			selected.delete(type);
		}
	}

	function toggleGroup(events: readonly EventType[], checked: boolean) {
		for (const event of events) {
			toggle(event.type, checked);
		}
	}
</script>

<div class="event-options">
	<RadioGroup
		name="eventScope"
		legend="Events"
		value={initialScope}
		description="All events includes future event types available to team webhooks."
	>
		<Radio value="all">Receive all event types</Radio>
		<Radio value="selected">Receive selected event types</Radio>
	</RadioGroup>
</div>
<div class="event-groups">
	{#each groups as [group, events], index (group)}
		{const allSelected = $derived(events.every((event) => selected.has(event.type)))}
		{const someSelected = $derived(events.some((event) => selected.has(event.type)))}
		<fieldset aria-labelledby={`${uid}-group-${index}`}>
			<Checkbox
				size="small"
				value={group}
				aria-label={`Select all ${group} events`}
				checked={allSelected}
				indeterminate={someSelected && !allSelected}
				onchange={(e) => toggleGroup(events, e.currentTarget.checked)}
			>
				<span class="group-title" id={`${uid}-group-${index}`}>{group}</span>
			</Checkbox>
			{#each events as event (event.type)}
				<Checkbox
					size="small"
					name="eventTypes"
					value={event.type}
					checked={selected.has(event.type)}
					onchange={(e) => toggle(event.type, e.currentTarget.checked)}
				>
					{formatWebhookEventName(event.type)}
					{#snippet description()}
						<div>{event.description}</div>
						<code>{event.cloudEventType}</code>
					{/snippet}
				</Checkbox>
			{/each}
		</fieldset>
	{/each}
</div>

<style>
	.event-groups {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		align-items: start;
		gap: var(--ax-space-24);
	}

	.event-options:has(:global(input[value='all']:checked)) + .event-groups {
		display: none;
	}

	fieldset {
		min-width: 0;
		margin: 0;
		padding: var(--ax-space-16);
		border: var(--sh-border-width) solid var(--border);
		border-radius: var(--radius-md);
		display: grid;
		gap: var(--ax-space-12);
		overflow-wrap: anywhere;
	}

	.group-title {
		font-weight: var(--ax-font-weight-bold);
	}

	@media (max-width: 767px) {
		.event-groups {
			grid-template-columns: 1fr;
		}
	}
</style>
