<script lang="ts">
	import { enhance } from '$app/forms';
	import type { WebhookEventTypes$result } from '$houdini';
	import { Alert, BodyLong, Button, Switch, TextField } from '#lib/shadcn/ui/index.js';
	import { FloppydiskIcon } from '#lib/icons/index.js';
	import WebhookEventTypeFields from './WebhookEventTypeFields.svelte';
	import WebhookSourceTeamFields from './WebhookSourceTeamFields.svelte';
	import {
		WEBHOOK_SECRET_MIN_LENGTH,
		type WebhookFormFields,
		type WebhookFormResult
	} from './webhooks.js';

	let {
		eventTypes,
		initialFields,
		hasSecret,
		ownerTeamSlug,
		formData,
		cancelHref
	}: {
		eventTypes: WebhookEventTypes$result['webhookEventTypes'];
		initialFields?: WebhookFormFields;
		hasSecret?: boolean;
		ownerTeamSlug: string;
		formData?: WebhookFormResult | null;
		cancelHref: string;
	} = $props();

	const fields = $derived(formData?.fields ?? initialFields);
	const editing = $derived(initialFields !== undefined);
	let saving = $state(false);
</script>

<form
	method="POST"
	use:enhance={() => {
		saving = true;
		return async ({ update }) => {
			try {
				await update();
			} finally {
				saving = false;
			}
		};
	}}
>
	<BodyLong>
		Webhooks send HTTP POST requests with CloudEvents payloads for the selected source teams.
		Payloads are signed with HMAC-SHA256 using your signing secret.
	</BodyLong>

	{#if formData?.errors?.length}
		<Alert variant="error">
			<ul>
				{#each formData.errors as error (error)}
					<li>{error}</li>
				{/each}
			</ul>
		</Alert>
	{/if}

	<TextField
		name="name"
		label="Webhook name"
		description="A display name to help identify this webhook."
		value={fields?.name ?? ''}
		required
		disabled={saving}
	/>
	<TextField
		name="url"
		type="url"
		label="Webhook URL"
		description="The HTTP or HTTPS endpoint that will receive webhook requests."
		value={fields?.url ?? ''}
		placeholder="https://example.com/webhook"
		required
		disabled={saving}
	/>
	<TextField
		name="secret"
		type="password"
		label={editing ? 'New signing secret' : 'Signing secret'}
		description={editing
			? `${hasSecret ? 'Secret configured.' : 'No secret configured.'} Leave blank to keep the current secret, or enter at least ${WEBHOOK_SECRET_MIN_LENGTH} characters to replace it.`
			: `Use a shared secret of at least ${WEBHOOK_SECRET_MIN_LENGTH} characters to verify payload signatures.`}
		autocomplete="new-password"
		required={!editing}
		minlength={WEBHOOK_SECRET_MIN_LENGTH}
		disabled={saving}
	/>

	<WebhookSourceTeamFields
		{ownerTeamSlug}
		initialSelected={fields?.sourceTeamSlugs ?? [ownerTeamSlug]}
		initialScope={fields?.sourceScope}
		disabled={saving}
	/>

	<WebhookEventTypeFields
		eventTypes={eventTypes.filter((event) => event.teamScoped)}
		initialScope={fields?.eventScope ?? 'all'}
		initialSelected={fields?.eventTypes ?? []}
	/>

	{#if editing}
		<Switch name="enabled" value="true" checked={fields?.enabled ?? true} disabled={saving}>
			Enabled
		</Switch>
	{:else}
		<BodyLong>New webhooks are enabled immediately. You can disable them after creation.</BodyLong>
	{/if}

	<div class="buttons">
		<Button type="submit" icon={FloppydiskIcon} loading={saving}>
			{editing ? 'Save changes' : 'Create webhook'}
		</Button>
		<Button as="a" href={cancelHref} variant="tertiary">Cancel</Button>
	</div>
</form>

<style>
	form {
		display: grid;
		gap: var(--ax-space-24);
		min-width: 0;
	}

	.buttons {
		display: flex;
		gap: var(--ax-space-8);
		flex-wrap: wrap;
	}
</style>
