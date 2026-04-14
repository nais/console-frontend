<script lang="ts">
	import type { InstanceGroupDetail$result } from '$houdini';
	import Time from '$lib/ui/Time.svelte';
	import {
		BodyShort,
		Chips,
		Heading,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		ToggleChip,
		Tr,
		Tag
	} from '@nais/ds-svelte-community';

	type Event =
		InstanceGroupDetail$result['team']['environment']['application']['instanceGroups'][number]['events'][number];
	type Instance =
		InstanceGroupDetail$result['team']['environment']['application']['instanceGroups'][number]['instances'][number];

	interface Props {
		events: Event[];
		instances: Instance[];
	}

	let { events, instances }: Props = $props();

	let eventFilter = $state<string | null>(null);

	const filteredEvents = $derived(
		events.filter((e) => {
			if (eventFilter === null) return true;
			return e.sourceInstance === eventFilter;
		})
	);

	function severityVariant(severity: string): 'warning' | 'info' {
		switch (severity) {
			case 'WARNING':
				return 'warning';
			default:
				return 'info';
		}
	}
</script>

{#if events.length > 0}
	<section>
		<Heading as="h3" size="small" spacing>
			Events ({events.length})
		</Heading>
		<BodyShort size="small" style="color: var(--ax-text-neutral-subtle)" spacing>
			Events are only available for approximately 30 minutes.
		</BodyShort>
		<Chips>
			<ToggleChip
				value="All"
				selected={eventFilter === null}
				onclick={() => (eventFilter = null)}
			/>
			{#each instances as instance (instance.id)}
				<ToggleChip
					value={instance.name}
					selected={eventFilter === instance.name}
					onclick={() => (eventFilter = instance.name)}
				/>
			{/each}
		</Chips>
		<Table size="small" zebraStripes>
			<Thead>
				<Tr>
					<Th>Severity</Th>
					<Th>Reason</Th>
					<Th>Message</Th>
					<Th>Instance</Th>
					<Th>Time</Th>
				</Tr>
			</Thead>
			<Tbody>
				{#each filteredEvents as event, i (i)}
					<Tr>
						<Td>
							<Tag size="small" variant={severityVariant(event.severity)}>
								{event.severity}
							</Tag>
						</Td>
						<Td><code>{event.reason}</code></Td>
						<Td>{event.message}</Td>
						<Td>
							{#if event.sourceInstance}
								<code>{event.sourceInstance}</code>
							{:else}
								<span class="muted">-</span>
							{/if}
						</Td>
						<Td><Time time={event.timestamp} distance /></Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
	</section>
{/if}

<style>
	section {
		display: flex;
		flex-direction: column;
	}

	.muted {
		color: var(--ax-text-neutral-subtle);
	}

	section :global(code) {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
	}
</style>
