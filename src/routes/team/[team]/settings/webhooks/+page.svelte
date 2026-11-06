<script lang="ts">
	import WebhookActivityCard from '#lib/domain/webhooks/WebhookActivityCard.svelte';
	import { PlusIcon } from '#lib/icons/index.js';
	import { BodyLong, BodyShort, Button, Detail, Heading, Tag } from '#lib/shadcn/ui/index.js';
	import CollapsibleSidebar from '#lib/ui/CollapsibleSidebar.svelte';
	import Collection from '#lib/ui/Collection.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import ListItem from '#lib/ui/ListItem.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import SectionBoundary from '#lib/ui/SectionBoundary.svelte';
	import Time from '#lib/ui/Time.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const { TeamWebhooks, TeamWebhooksActivity, viewerIsOwner, isAdmin, teamSlug } = $derived(data);
	const connection = $derived($TeamWebhooks.data?.team.webhooks);
</script>

<GraphErrors errors={$TeamWebhooks.errors} />
<div class="layout-two-column">
	<div>
		<BodyLong spacing>
			Webhooks owned by this team receive HTTP callbacks for activity from selected teams or all
			teams.
		</BodyLong>

		{#if connection}
			<Collection title="Webhooks" count={connection.pageInfo.totalCount}>
				{#snippet actions()}
					{#if viewerIsOwner || isAdmin}
						<Button
							as="a"
							href="/team/{teamSlug}/settings/webhooks/create"
							variant="secondary"
							size="small"
							icon={PlusIcon}
						>
							Create webhook
						</Button>
					{/if}
				{/snippet}

				{#each connection.nodes as webhook (webhook.id)}
					{const latestDelivery = $derived(webhook.deliveries.nodes[0])}
					<ListItem>
						<div class="webhook-item">
							<div class="identity">
								<div class="title-row">
									<Heading as="h3" size="xsmall">
										<a href="/team/{teamSlug}/settings/webhooks/{webhook.id}">{webhook.name}</a>
									</Heading>
									<Tag
										size="small"
										variant={webhook.enabled ? 'success' : webhook.disabledAt ? 'error' : 'neutral'}
									>
										{webhook.enabled
											? 'Enabled'
											: webhook.disabledAt
												? 'Auto-disabled'
												: 'Disabled'}
									</Tag>
								</div>
								<BodyShort size="small">{webhook.url}</BodyShort>
								<Detail>Created <Time time={webhook.createdAt} distance /></Detail>
							</div>
							<div class="delivery-summary">
								<Detail>{latestDelivery?.isTest ? 'Last delivery (test)' : 'Last delivery'}</Detail>
								{#if latestDelivery}
									<div class="delivery-result">
										<Tag size="small" variant={latestDelivery.success ? 'success' : 'error'}>
											{latestDelivery.success ? 'Success' : 'Failed'}
										</Tag>
										<BodyShort size="small">
											<Time time={latestDelivery.createdAt} distance />
										</BodyShort>
									</div>
								{:else}
									<BodyShort size="small">No delivery attempts yet.</BodyShort>
								{/if}
								{#if webhook.consecutiveFailures > 0}
									<Detail>
										{webhook.consecutiveFailures} consecutive
										{webhook.consecutiveFailures === 1 ? 'failure' : 'failures'}
									</Detail>
								{/if}
							</div>
						</div>
					</ListItem>
				{:else}
					<ListItem>
						<BodyLong
							>No webhooks configured. Create one to start receiving team activity events.</BodyLong
						>
					</ListItem>
				{/each}
			</Collection>

			<Pagination
				page={connection.pageInfo}
				fetching={$TeamWebhooks.fetching}
				loaders={{
					loadPreviousPage: () =>
						changeParams({ before: connection.pageInfo.startCursor ?? '', after: '' }),
					loadNextPage: () =>
						changeParams({ after: connection.pageInfo.endCursor ?? '', before: '' })
				}}
			/>
		{/if}
	</div>
	<CollapsibleSidebar>
		{#snippet extras()}
			<aside aria-label="Webhook activity">
				<SectionBoundary message="Unable to display webhook activity.">
					{#key TeamWebhooksActivity}
						<WebhookActivityCard activityStore={TeamWebhooksActivity} />
					{/key}
				</SectionBoundary>
			</aside>
		{/snippet}
	</CollapsibleSidebar>
</div>

<style>
	.webhook-item {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--ax-space-16);
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.identity,
	.delivery-summary {
		display: grid;
		gap: var(--ax-space-4);
		min-width: 0;
	}

	.delivery-summary {
		justify-items: end;
		text-align: right;
	}

	.title-row,
	.delivery-result {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--ax-space-8);
	}

	.delivery-result {
		justify-content: flex-end;
	}

	@container (max-width: 500px) {
		.webhook-item {
			grid-template-columns: minmax(0, 1fr);
		}

		.delivery-summary {
			justify-items: start;
			text-align: left;
		}

		.delivery-result {
			justify-content: flex-start;
		}
	}
</style>
