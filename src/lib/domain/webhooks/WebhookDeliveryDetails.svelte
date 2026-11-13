<script lang="ts">
	import type { WebhookDeliveryFields$data } from '$houdini';
	import {
		Alert,
		BodyLong,
		BodyShort,
		Heading,
		Tab,
		TabList,
		TabPanel,
		Tabs
	} from '#lib/shadcn/ui/index.js';
	import Time from '#lib/ui/Time.svelte';
	import { capitalizeFirstLetter } from '#lib/utils/formatters.js';

	let { delivery }: { delivery: WebhookDeliveryFields$data } = $props();

	function formatBody(body: string): string {
		try {
			const parsed: unknown = JSON.parse(body);
			return JSON.stringify(parsed, null, 2);
		} catch (error) {
			if (error instanceof SyntaxError) return body;
			throw error;
		}
	}

	const messages = $derived([
		{
			value: 'request',
			label: 'Request',
			headers: delivery.requestHeaders,
			body: formatBody(delivery.requestBody)
		},
		{
			value: 'response',
			label: 'Response',
			headers: delivery.responseHeaders,
			body: delivery.responseBody === null ? null : formatBody(delivery.responseBody)
		}
	]);
</script>

<div class="delivery-details">
	{#if delivery.errorMessage}
		<Alert variant="error">{delivery.errorMessage}</Alert>
	{/if}

	<div>
		<Heading as="h3" size="xsmall" spacing>Attempt state</Heading>
		<BodyShort>
			{capitalizeFirstLetter(delivery.deliveryState.status.toLowerCase())}
		</BodyShort>
		<BodyShort>
			Attempt {delivery.deliveryState.attemptCount}
		</BodyShort>
		{#if delivery.deliveryState.nextRetryAt}
			<BodyShort>
				Retry scheduled for <Time
					time={delivery.deliveryState.nextRetryAt}
					dateFormat="d MMM yyyy, HH:mm:ss"
				/>
			</BodyShort>
		{/if}
		{#if delivery.isTest && !delivery.success}
			<BodyShort>No retries</BodyShort>
		{/if}
	</div>

	<Tabs defaultValue="request" size="small">
		<TabList aria-label="Delivery request and response">
			{#each messages as message (message.value)}
				<Tab value={message.value}>{message.label}</Tab>
			{/each}
		</TabList>
		{#each messages as message (message.value)}
			<TabPanel value={message.value}>
				<div class="message">
					<div>
						<Heading as="h3" size="xsmall" spacing>Headers</Heading>
						{#if message.headers.length}
							<pre class="headers">{#each message.headers as header, index (header.name)}<strong
										>{header.name}:</strong
									>{` ${header.values.join(', ')}`}{index < message.headers.length - 1
										? '\n'
										: ''}{/each}</pre>
						{:else}
							<BodyLong>No headers recorded.</BodyLong>
						{/if}
					</div>
					<div>
						<Heading as="h3" size="xsmall" spacing>Body</Heading>
						{#if message.value === 'response' && delivery.responseBodyTruncated}
							<Alert variant="warning">Response body truncated to 10 KiB.</Alert>
						{/if}
						{#if message.body === null}
							<BodyLong>No text response body.</BodyLong>
						{:else if message.body === ''}
							<BodyLong>Empty response body.</BodyLong>
						{:else}
							<pre class="body">{message.body}</pre>
						{/if}
					</div>
				</div>
			</TabPanel>
		{/each}
	</Tabs>
</div>

<style>
	.delivery-details {
		display: grid;
		gap: var(--nais-space-24);
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.message {
		display: grid;
		gap: var(--nais-space-24);
		padding-top: var(--nais-space-16);
		min-width: 0;
	}

	.headers strong {
		font-weight: var(--sh-font-weight-bold);
	}

	pre {
		margin: 0;
		padding: var(--nais-space-16);
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font-family: monospace;
		background: var(--background-subtle);
		border-radius: var(--radius-md);
	}
</style>
