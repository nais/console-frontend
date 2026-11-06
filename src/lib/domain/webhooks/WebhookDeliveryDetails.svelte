<script lang="ts">
	import type { WebhookDeliveryFields$data } from '$houdini';
	import { Alert, BodyLong, BodyShort, Heading } from '#lib/shadcn/ui/index.js';
	import Time from '#lib/ui/Time.svelte';
	import { formatWebhookEventName } from './webhooks.js';

	let { delivery }: { delivery: WebhookDeliveryFields$data } = $props();
</script>

<div class="delivery-details">
	{#if delivery.errorMessage}
		<Alert variant="error">{delivery.errorMessage}</Alert>
	{/if}

	<div>
		<Heading as="h3" size="xsmall" spacing>Current delivery state</Heading>
		{#if delivery.isTest}
			<BodyShort>{delivery.success ? 'Succeeded' : 'Failed'}</BodyShort>
			{#if !delivery.success}
				<BodyShort>No retries</BodyShort>
			{/if}
			<BodyLong>
				Test events make one attempt, are never retried, and do not affect webhook health.
			</BodyLong>
		{:else if delivery.deliveryState}
			<BodyShort>
				{formatWebhookEventName(delivery.deliveryState.status)}
				- {delivery.deliveryState.attemptCount}
				{delivery.deliveryState.attemptCount === 1 ? 'attempt' : 'attempts'}
			</BodyShort>
			{#if delivery.deliveryState.nextRetryAt}
				<BodyShort>
					Will retry at <Time
						time={delivery.deliveryState.nextRetryAt}
						dateFormat="d MMM yyyy, HH:mm:ss"
					/>
				</BodyShort>
			{/if}
			<BodyShort size="small">
				This is the current state shared by all attempts for this event, not this attempt's result.
			</BodyShort>
		{:else}
			<BodyLong>Queue state is no longer available for this delivery.</BodyLong>
		{/if}
	</div>

	<BodyShort size="small">
		Headers are filtered for diagnostics; credentials and unapproved headers are omitted.
	</BodyShort>

	{#each [{ title: 'Request headers', headers: delivery.requestHeaders }, { title: 'Response headers', headers: delivery.responseHeaders }] as group (group.title)}
		<div>
			<Heading as="h3" size="xsmall" spacing>{group.title}</Heading>
			{#if group.headers.length}
				<dl class="headers">
					{#each group.headers as header (header.name)}
						<div>
							<dt><code>{header.name}</code></dt>
							<dd>
								{#each header.values as value, index (index)}
									<pre>{value}</pre>
								{/each}
							</dd>
						</div>
					{/each}
				</dl>
			{:else}
				<BodyLong>No headers recorded.</BodyLong>
			{/if}
		</div>
	{/each}

	<div>
		<Heading as="h3" size="xsmall" spacing>Request body</Heading>
		{#if !delivery.isTest}
			<BodyShort size="small">
				The CloudEvents time is the source activity time, not the delivery attempt time.
			</BodyShort>
		{/if}
		<pre>{delivery.requestBody}</pre>
	</div>
	<div>
		<Heading as="h3" size="xsmall" spacing>Response body</Heading>
		{#if delivery.responseBodyTruncated}
			<Alert variant="warning">The recorded response body was truncated to 10 KiB.</Alert>
		{/if}
		{#if delivery.responseBody === null}
			<BodyLong>No text response body available (no response or binary content).</BodyLong>
		{:else if delivery.responseBody === ''}
			<BodyLong>Empty response body.</BodyLong>
		{:else}
			<pre>{delivery.responseBody}</pre>
		{/if}
	</div>
</div>

<style>
	.delivery-details {
		display: grid;
		gap: var(--ax-space-24);
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.headers {
		display: grid;
		gap: var(--ax-space-12);
		margin: 0;
	}

	dt {
		font-weight: var(--ax-font-weight-bold);
		margin-bottom: var(--ax-space-4);
	}

	dd {
		margin: 0;
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
