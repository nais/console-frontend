<script lang="ts">
	import { serviceAccountTokenForm } from '$lib/forms/service-account-token';
	import Form from '$lib/ui/Form/Form.svelte';
	import { isPossiblyInModal } from '$lib/ui/PageModal.svelte';
	import type { FormProps } from '$lib/ui/Form/form';
	import { Alert, BodyLong, Button, CopyButton } from '@nais/ds-svelte-community';
	import { DEFAULT_EXPIRY } from './tokenExpiry';

	const {
		form,
		backHref,
		bindingAddHref
	}: {
		form: FormProps<(typeof serviceAccountTokenForm)[number]> | null;
		backHref: string;
		bindingAddHref: string;
	} = $props();

	let createdSecret: string | null = $state(null);
</script>

{#if createdSecret}
	<Alert variant="success">
		Token created successfully. Copy the secret below - it will not be shown again.
	</Alert>
	<div class="token-secret">
		<code>{createdSecret}</code>
		<CopyButton
			text="Copy"
			activeText="Copied"
			variant="action"
			copyText={createdSecret}
			size="small"
		/>
	</div>
	{#if !isPossiblyInModal()}
		<Button as="a" size="small" variant="secondary" href={backHref}>Back to service account</Button>
	{/if}
{:else}
	<BodyLong>
		API tokens should only be used when you need to authenticate to the Nais API from outside of
		Nais.
	</BodyLong>
	<BodyLong>
		If you need to authenticate from within Nais, for example from an application or a job, you
		should
		<a href={bindingAddHref}>create a workload binding for the service account</a> instead.
	</BodyLong>

	<Form
		fields={serviceAccountTokenForm}
		{form}
		defaultValues={{ expiresIn: DEFAULT_EXPIRY }}
		button="Create token"
		onresult={(result) => {
			if (result.type === 'success') {
				createdSecret = (result.data as { secret?: string | null })?.secret ?? null;
			}
		}}
	>
		{#snippet actions({ submitting })}
			<Button
				type="button"
				size="small"
				variant="tertiary"
				disabled={submitting}
				onclick={() => history.back()}
			>
				Cancel
			</Button>
		{/snippet}
	</Form>
{/if}

<style>
	.token-secret {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		background-color: var(--ax-bg-sunken);
		padding: var(--ax-space-12);
		border-radius: var(--ax-radius-8);
		overflow-x: auto;
	}

	.token-secret code {
		font-size: var(--ax-font-size-small);
		word-break: break-all;
	}
</style>
