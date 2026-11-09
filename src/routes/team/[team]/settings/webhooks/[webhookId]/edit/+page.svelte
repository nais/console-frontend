<script lang="ts">
	import WebhookForm from '#lib/domain/webhooks/WebhookForm.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { Heading } from '#lib/shadcn/ui/index.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const { WebhookSettings, WebhookEventTypes } = $derived(data);
	const node = $derived($WebhookSettings.data?.node);
	const webhook = $derived(node?.__typename === 'WebhookSubscription' ? node : null);
	const uid = $props.id();
</script>

<section aria-labelledby={uid}>
	<Heading as="h2" size="small" id={uid} spacing>Edit webhook</Heading>
	<GraphErrors errors={$WebhookSettings.errors} />
	<GraphErrors errors={$WebhookEventTypes.errors} />
	{#if webhook && $WebhookEventTypes.data}
		{#key form ?? webhook.id}
			<WebhookForm
				eventTypes={$WebhookEventTypes.data.webhookEventTypes}
				hasSecret={webhook.hasSecret}
				ownerTeamSlug={data.teamSlug}
				initialFields={{
					name: webhook.name,
					url: webhook.url,
					eventScope: webhook.allEvents ? 'all' : 'selected',
					eventTypes: [...webhook.eventTypes],
					sourceTeamSlugs: [...webhook.sourceTeamSlugs],
					enabled: webhook.enabled
				}}
				formData={form}
				cancelHref="/team/{data.teamSlug}/settings/webhooks/{webhook.id}"
			/>
		{/key}
	{/if}
</section>
