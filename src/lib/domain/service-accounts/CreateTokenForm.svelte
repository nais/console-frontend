<script lang="ts">
	import { enhance } from '$app/forms';
	import { isPossiblyInModal } from '$lib/ui/PageModal.svelte';
	import {
		Alert,
		BodyLong,
		Button,
		CopyButton,
		ErrorMessage,
		TextField
	} from '@nais/ds-svelte-community';

	const {
		backHref,
		bindingAddHref
	}: {
		backHref: string;
		bindingAddHref: string;
	} = $props();

	let createdSecret: string | null = $state(null);
	let errorMessage: string | undefined = $state();
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

	<form
		method="POST"
		use:enhance={() => {
			errorMessage = undefined;
			return async ({ result }) => {
				if (result.type === 'failure') {
					errorMessage = (result.data as { error?: string })?.error ?? 'Unknown error';
				} else if (result.type === 'success') {
					createdSecret = (result.data as { secret?: string | null })?.secret ?? null;
				}
			};
		}}
	>
		{#if errorMessage}
			<ErrorMessage>{errorMessage}</ErrorMessage>
		{/if}

		<TextField size="small" label="Token name" name="name" required autocomplete="off" />
		<TextField size="small" label="Description" name="description" required autocomplete="off" />
		<TextField size="small" label="Expires at (optional)" name="expiresAt" type="date" />

		<div class="actions">
			<Button type="submit" size="small">Create token</Button>
			<Button type="button" size="small" variant="tertiary" onclick={() => history.back()}>
				Cancel
			</Button>
		</div>
	</form>
{/if}

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}

	.actions {
		display: flex;
		gap: var(--ax-space-8);
	}

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
