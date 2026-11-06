<script lang="ts">
	import WebhookForm from '#lib/domain/webhooks/WebhookForm.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { Heading } from '#lib/shadcn/ui/index.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const { WebhookEventTypes } = $derived(data);
	const uid = $props.id();
</script>

<section aria-labelledby={uid}>
	<Heading as="h2" size="small" id={uid} spacing>Create webhook</Heading>
	<GraphErrors errors={$WebhookEventTypes.errors} />
	{#if $WebhookEventTypes.data}
		{#key form}
			<WebhookForm
				ownerTeamSlug={data.teamSlug}
				eventTypes={$WebhookEventTypes.data.webhookEventTypes}
				formData={form}
				cancelHref="/team/{data.teamSlug}/settings/webhooks"
			/>
		{/key}
	{/if}
</section>
