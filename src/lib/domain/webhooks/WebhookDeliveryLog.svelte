<script lang="ts">
	import type { TeamWebhookDeliveries$result } from '$houdini';
	import {
		BodyLong,
		Button,
		Heading,
		Table,
		Tag,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '#lib/shadcn/ui/index.js';
	import { ChevronDownIcon, ChevronUpIcon } from '#lib/icons/index.js';
	import Pagination from '#lib/ui/Pagination.svelte';
	import Time from '#lib/ui/Time.svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { formatWebhookEventName } from './webhooks.js';

	type Webhook = Extract<
		NonNullable<TeamWebhookDeliveries$result['node']>,
		{ __typename: 'WebhookSubscription' }
	>;

	let {
		deliveries,
		fetching,
		onprevious,
		onnext
	}: {
		deliveries: Webhook['deliveries'];
		fetching: boolean;
		onprevious: () => void;
		onnext: () => void;
	} = $props();

	const uid = $props.id();
	const expanded = new SvelteSet<string>();

	function toggle(id: string) {
		if (expanded.has(id)) {
			expanded.delete(id);
		} else {
			expanded.add(id);
		}
	}
</script>

<section aria-labelledby={`${uid}-heading`}>
	<Heading as="h2" size="small" id={`${uid}-heading`} spacing>
		Delivery log ({deliveries.pageInfo.totalCount})
	</Heading>

	{#if deliveries.pageInfo.totalCount === 0}
		<BodyLong>No delivery attempts yet.</BodyLong>
	{:else}
		<div class="table-scroll">
			<Table size="small">
				<Thead>
					<Tr>
						<Th><span class="sr-only">Details</span></Th>
						<Th>Time</Th>
						<Th>Event type</Th>
						<Th>HTTP status</Th>
						<Th>Duration</Th>
						<Th>Result</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each deliveries.nodes as delivery (delivery.id)}
						<Tr>
							<Td>
								<Button
									size="small"
									variant="tertiary"
									icon={expanded.has(delivery.id) ? ChevronUpIcon : ChevronDownIcon}
									aria-label={expanded.has(delivery.id)
										? 'Collapse delivery details'
										: 'Expand delivery details'}
									aria-expanded={expanded.has(delivery.id)}
									aria-controls={`${uid}-${delivery.id}`}
									onclick={() => toggle(delivery.id)}
								/>
							</Td>
							<Td><Time time={delivery.createdAt} distance /></Td>
							<Td
								><span title={delivery.eventType}>{formatWebhookEventName(delivery.eventType)}</span
								></Td
							>
							<Td>
								<Tag size="small" variant={delivery.success ? 'success' : 'error'}>
									{delivery.responseStatus ?? 'No response'}
								</Tag>
							</Td>
							<Td>{delivery.durationMs} ms</Td>
							<Td>
								<Tag size="small" variant={delivery.success ? 'success' : 'error'}>
									{delivery.success ? 'Success' : 'Failed'}
								</Tag>
							</Td>
						</Tr>
						<Tr id={`${uid}-${delivery.id}`} hidden={!expanded.has(delivery.id)}>
							<Td colspan={6}>
								<div class="delivery-bodies">
									<div>
										<Heading as="h3" size="xsmall" spacing>Request body</Heading>
										<pre>{delivery.requestBody}</pre>
									</div>
									<div>
										<Heading as="h3" size="xsmall" spacing>Response body</Heading>
										{#if delivery.responseBody}
											<pre>{delivery.responseBody}</pre>
										{:else}
											<BodyLong>
												{delivery.responseBody === null
													? 'No response body.'
													: 'Empty response body.'}
											</BodyLong>
										{/if}
									</div>
								</div>
							</Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
		</div>
	{/if}

	<Pagination
		page={deliveries.pageInfo}
		{fetching}
		loaders={{ loadPreviousPage: onprevious, loadNextPage: onnext }}
	/>
</section>

<style>
	.delivery-bodies {
		display: grid;
		gap: var(--ax-space-24);
		padding: var(--ax-space-16);
	}

	pre {
		margin: 0;
		padding: var(--ax-space-16);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font-family: monospace;
		background: var(--ax-neutral-100);
		border-radius: var(--radius-md);
	}
</style>
