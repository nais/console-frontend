<script lang="ts">
	import { enhance } from '$app/forms';
	import WebhookActivityCard from '#lib/domain/webhooks/WebhookActivityCard.svelte';
	import WebhookDeliveryLog from '#lib/domain/webhooks/WebhookDeliveryLog.svelte';
	import WebhookEvents from '#lib/domain/webhooks/WebhookEvents.svelte';
	import {
		ActionMenu,
		ActionMenuDivider,
		ActionMenuItem,
		Alert,
		BodyLong,
		BodyShort,
		Button,
		CopyButton,
		Heading,
		Modal,
		Tag
	} from '#lib/shadcn/ui/index.js';
	import {
		ArrowCirclepathIcon,
		MenuElipsisVerticalIcon,
		PencilIcon,
		SendIcon,
		TrashIcon
	} from '#lib/icons/index.js';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import HeaderActions from '#lib/ui/HeaderActions.svelte';
	import SectionBoundary from '#lib/ui/SectionBoundary.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import Time from '#lib/ui/Time.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const {
		WebhookSettings,
		TeamWebhookActivity,
		TeamWebhookDeliveries,
		WebhookEventTypes,
		viewerIsOwner,
		isAdmin,
		teamSlug
	} = $derived(data);
	const node = $derived($WebhookSettings.errors?.length ? null : $WebhookSettings.data?.node);
	const webhook = $derived(node?.__typename === 'WebhookSubscription' ? node : null);
	const deliveryNode = $derived(
		$TeamWebhookDeliveries.errors?.length ? null : $TeamWebhookDeliveries.data?.node
	);
	const deliveries = $derived(
		deliveryNode?.__typename === 'WebhookSubscription' ? deliveryNode.deliveries : null
	);
	const canManage = $derived(viewerIsOwner || isAdmin);
	const uid = $props.id();
	let deleteOpen = $state(false);
	let deleting = $state(false);
	let enabling = $state(false);
	let testing = $state(false);
</script>

{#if webhook && canManage}
	<HeaderActions>
		<ActionMenu>
			{#snippet trigger(props)}
				<Button
					variant="secondary"
					size="small"
					icon={MenuElipsisVerticalIcon}
					iconPosition="right"
					loading={enabling || testing}
					{...props}
				>
					Actions
				</Button>
			{/snippet}
			<ActionMenuItem
				icon={SendIcon}
				form={`${uid}-test`}
				disabled={testing}
				onselect={(event: MouseEvent & { currentTarget: HTMLButtonElement }) =>
					event.currentTarget.form?.requestSubmit()}
			>
				Send test event
			</ActionMenuItem>
			{#if !webhook.enabled}
				<ActionMenuItem
					icon={ArrowCirclepathIcon}
					form={`${uid}-enable`}
					disabled={enabling}
					onselect={(event: MouseEvent & { currentTarget: HTMLButtonElement }) =>
						event.currentTarget.form?.requestSubmit()}
				>
					Re-enable webhook
				</ActionMenuItem>
			{/if}
			<ActionMenuItem href="/team/{teamSlug}/settings/webhooks/{webhook.id}/edit" icon={PencilIcon}>
				Edit
			</ActionMenuItem>
			<ActionMenuDivider />
			<ActionMenuItem icon={TrashIcon} variant="danger" onselect={() => (deleteOpen = true)}>
				Delete
			</ActionMenuItem>
		</ActionMenu>
	</HeaderActions>
{/if}

<GraphErrors errors={$WebhookSettings.errors} />
{#if form?.errors?.length}
	<Alert variant="error">
		{#each form.errors as error (error)}
			<p>{error}</p>
		{/each}
	</Alert>
{/if}

<div class="webhook-detail">
	{#if webhook}
		{#if canManage}
			<form
				id={`${uid}-test`}
				hidden
				method="POST"
				action="?/test"
				use:enhance={() => {
					testing = true;
					return async ({ update }) => {
						try {
							await update();
						} finally {
							testing = false;
						}
					};
				}}
			></form>
		{/if}
		{#if canManage && !webhook.enabled}
			<form
				id={`${uid}-enable`}
				hidden
				method="POST"
				action="?/enable"
				use:enhance={() => {
					enabling = true;
					return async ({ update }) => {
						try {
							await update();
						} finally {
							enabling = false;
						}
					};
				}}
			></form>
		{/if}
		{#if webhook.disabledAt}
			<Alert variant="error">
				This webhook was automatically disabled after repeated delivery failures on
				<Time time={webhook.disabledAt} />. Check the delivery log before re-enabling it.
			</Alert>
		{:else if webhook.consecutiveFailures > 0}
			<Alert variant="warning">
				This webhook has {webhook.consecutiveFailures} consecutive
				{webhook.consecutiveFailures === 1 ? 'delivery failure' : 'delivery failures'}. Check the
				delivery log for details.
			</Alert>
		{/if}

		<div class="layout-two-column">
			<div class="main-column">
				<section aria-labelledby={`${uid}-endpoint`}>
					<div class="section-heading">
						<Heading as="h2" size="small" id={`${uid}-endpoint`}>{webhook.name}</Heading>
						<Tag size="small" variant={webhook.enabled ? 'success' : 'neutral'}>
							{webhook.enabled ? 'Enabled' : 'Disabled'}
						</Tag>
					</div>
					<div class="endpoint-url">
						<code>{webhook.url}</code>
						<CopyButton copyText={webhook.url} size="small" aria-label="Copy webhook URL" />
					</div>
					<BodyShort size="small">HTTP POST requests with signed CloudEvents payloads.</BodyShort>
					{#if !webhook.enabled}
						<BodyShort size="small"
							>Queued deliveries are paused while this webhook is disabled.</BodyShort
						>
					{/if}
					{#if canManage}
						<BodyShort size="small">
							Send a test event from Actions, even while disabled. Limited to one test every 30
							seconds; tests never retry or affect webhook health.
						</BodyShort>
					{/if}
				</section>

				<section aria-labelledby={`${uid}-events`}>
					<Heading as="h2" size="small" id={`${uid}-events`} spacing>Subscribed events</Heading>
					<GraphErrors errors={$WebhookEventTypes.errors} />
					{#if $WebhookEventTypes.data || webhook.allEvents}
						<WebhookEvents
							allEvents={webhook.allEvents}
							eventTypes={webhook.eventTypes}
							metadata={$WebhookEventTypes.data?.webhookEventTypes ?? []}
						/>
					{/if}
				</section>

				<section aria-labelledby={`${uid}-sources`} class="event-sources">
					<Heading as="h2" size="small" id={`${uid}-sources`} spacing>Event sources</Heading>
					<BodyShort>
						{webhook.sourceTeamSlugs.length === 0
							? 'All teams (excluding global events)'
							: webhook.sourceTeamSlugs.join(', ')}
					</BodyShort>
				</section>

				<div>
					<GraphErrors errors={$TeamWebhookDeliveries.errors} />
					{#if deliveries || form?.testDelivery}
						<WebhookDeliveryLog
							{deliveries}
							eventTypes={$WebhookEventTypes.data?.webhookEventTypes ?? []}
							testDelivery={form?.testDelivery}
							fetching={$TeamWebhookDeliveries.fetching}
							onprevious={() =>
								changeParams({ before: deliveries?.pageInfo.startCursor ?? '', after: '' })}
							onnext={() =>
								changeParams({ after: deliveries?.pageInfo.endCursor ?? '', before: '' })}
						/>
					{/if}
				</div>
			</div>

			<aside class="layout-sidebar" aria-label="Webhook information">
				<SurfaceCard title="Details">
					<dl class="metadata">
						<div>
							<dt>Owner team</dt>
							<dd>{webhook.teamSlug}</dd>
						</div>
						<div>
							<dt>Signing secret</dt>
							<dd>{webhook.hasSecret ? 'Secret configured' : 'No secret configured'}</dd>
						</div>
						<div>
							<dt>Consecutive failures</dt>
							<dd>{webhook.consecutiveFailures}</dd>
						</div>
						<div>
							<dt>Created</dt>
							<dd><Time time={webhook.createdAt} distance /></dd>
						</div>
						<div>
							<dt>Last updated</dt>
							<dd><Time time={webhook.updatedAt} distance /></dd>
						</div>
					</dl>
				</SurfaceCard>
				<SectionBoundary message="Unable to display webhook activity.">
					{#key TeamWebhookActivity}
						<WebhookActivityCard activityStore={TeamWebhookActivity} />
					{/key}
				</SectionBoundary>
			</aside>
		</div>

		{#if canManage}
			<Modal bind:open={deleteOpen} header="Delete webhook" width="small">
				<form
					class="delete-form"
					method="POST"
					action="?/delete"
					use:enhance={() => {
						deleting = true;
						return async ({ update }) => {
							try {
								await update();
								deleteOpen = false;
							} finally {
								deleting = false;
							}
						};
					}}
				>
					<BodyLong>
						Delete the webhook <strong>{webhook.name}</strong> for <code>{webhook.url}</code>? It
						will no longer receive team events. This cannot be undone.
					</BodyLong>
					<div class="delete-actions">
						<Button type="submit" variant="danger" loading={deleting}>Delete webhook</Button>
						<Button variant="tertiary" onclick={() => (deleteOpen = false)} disabled={deleting}>
							Cancel
						</Button>
					</div>
				</form>
			</Modal>
		{/if}
	{/if}
</div>

<style>
	.webhook-detail {
		display: grid;
		gap: var(--ax-space-32);
		min-width: 0;
	}

	.main-column {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-32);
		min-width: 0;
	}

	.layout-sidebar {
		order: 0;
	}

	.section-heading,
	.endpoint-url {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-16);
	}

	.section-heading {
		flex-wrap: wrap;
	}

	.section-heading {
		margin-bottom: var(--ax-space-16);
	}

	.endpoint-url {
		padding: var(--ax-space-16);
		margin-bottom: var(--ax-space-12);
		background: var(--ax-neutral-100);
		border: var(--sh-border-width) solid var(--border);
		border-radius: var(--radius-md);
	}

	.endpoint-url code {
		min-width: 0;
	}

	.metadata {
		display: grid;
		gap: var(--ax-space-16);
		margin: 0;
		font-size: var(--ax-font-size-small);
	}

	dt {
		margin-bottom: var(--ax-space-4);
		font-weight: var(--ax-font-weight-bold);
	}

	dd {
		margin: 0;
	}

	dd,
	code,
	.section-heading,
	.delete-form,
	.event-sources {
		overflow-wrap: anywhere;
	}

	.delete-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ax-space-8);
		margin-top: var(--ax-space-24);
	}
</style>
