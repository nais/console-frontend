<script lang="ts">
	import type { TeamWebhookDeliveries$result, WebhookDeliveryFields$data } from '$houdini';
	import {
		BodyLong,
		BodyShort,
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
	import { SvelteMap } from 'svelte/reactivity';
	import WebhookDeliveryDetails from './WebhookDeliveryDetails.svelte';
	import { formatWebhookEventName } from './webhooks.js';

	type Webhook = Extract<
		NonNullable<TeamWebhookDeliveries$result['node']>,
		{ __typename: 'WebhookSubscription' }
	>;

	let {
		deliveries,
		testDelivery,
		fetching,
		onprevious,
		onnext
	}: {
		deliveries: Webhook['deliveries'] | null;
		testDelivery?: WebhookDeliveryFields$data | null;
		fetching: boolean;
		onprevious: () => void;
		onnext: () => void;
	} = $props();

	const uid = $props.id();
	const expanded = new SvelteMap<string, boolean>();
	const nodes = $derived(
		testDelivery
			? [testDelivery, ...(deliveries?.nodes ?? []).filter(({ id }) => id !== testDelivery.id)]
			: (deliveries?.nodes ?? [])
	);
	const totalCount = $derived(
		!testDelivery || deliveries?.nodes.some(({ id }) => id === testDelivery.id)
			? deliveries?.pageInfo.totalCount
			: undefined
	);

	function isExpanded(id: string) {
		return expanded.get(id) ?? id === testDelivery?.id;
	}

	function toggle(id: string) {
		expanded.set(id, !isExpanded(id));
	}
</script>

<section aria-labelledby={`${uid}-heading`}>
	<Heading as="h2" size="small" id={`${uid}-heading`} spacing>
		Delivery log{totalCount === undefined ? '' : ` (${totalCount})`}
	</Heading>

	{#if nodes.length === 0}
		<BodyLong>No delivery attempts yet.</BodyLong>
	{:else}
		<div class="table-scroll">
			<Table size="small">
				<Thead>
					<Tr>
						<Th><span class="sr-only">Details</span></Th>
						<Th>Attempted at</Th>
						<Th>Event type</Th>
						<Th>HTTP status</Th>
						<Th>Duration</Th>
						<Th>Result</Th>
						<Th>Attempt state</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each nodes as delivery (delivery.id)}
						<Tr>
							<Td>
								<Button
									size="small"
									variant="tertiary"
									icon={isExpanded(delivery.id) ? ChevronUpIcon : ChevronDownIcon}
									aria-label={isExpanded(delivery.id)
										? 'Collapse delivery details'
										: 'Expand delivery details'}
									aria-expanded={isExpanded(delivery.id)}
									aria-controls={`${uid}-${delivery.id}`}
									onclick={() => toggle(delivery.id)}
								/>
							</Td>
							<Td><Time time={delivery.createdAt} distance /></Td>
							<Td
								><span title={delivery.eventType}>{formatWebhookEventName(delivery.eventType)}</span
								>
								{#if delivery.isTest}
									<Tag size="small" variant="neutral">Test</Tag>
								{/if}</Td
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
							<Td>
								{delivery.deliveryState
									? formatWebhookEventName(delivery.deliveryState.status)
									: 'Not available'}
								{#if delivery.isTest && !delivery.success}
									<BodyShort size="small">No retries</BodyShort>
								{/if}
							</Td>
						</Tr>
						<Tr id={`${uid}-${delivery.id}`} hidden={!isExpanded(delivery.id)}>
							<Td colspan={7}>
								<div class="delivery-content">
									<WebhookDeliveryDetails {delivery} />
								</div>
							</Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
		</div>
	{/if}

	<Pagination
		page={deliveries?.pageInfo}
		{fetching}
		loaders={{ loadPreviousPage: onprevious, loadNextPage: onnext }}
	/>
</section>

<style>
	.delivery-content {
		padding: var(--ax-space-16);
	}
</style>
