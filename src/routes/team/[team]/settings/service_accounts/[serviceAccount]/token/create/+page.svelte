<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Alert,
		Button,
		CopyButton,
		ErrorMessage,
		Heading,
		TextField
	} from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	const { CreateTokenSALookup } = $derived(data);

	const serviceAccount = $derived(
		$CreateTokenSALookup.data?.team.serviceAccounts.nodes.find(
			(sa) => sa.name === data.serviceAccountName
		)
	);

	let createdSecret: string | null = $state(null);
	let errorMessage: string | undefined = $state();
</script>

<div class="page">
	<Heading size="small" as="h2">Create API token</Heading>

	{#if !serviceAccount}
		<Alert variant="warning">Service account not found.</Alert>
	{:else if createdSecret}
		<Alert variant="success">
			Token created successfully. Copy the secret below — it will not be shown again.
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
		<Button
			size="small"
			variant="secondary"
			onclick={() => history.back()}
		>
			Back to service account
		</Button>
	{:else}
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
			<input type="hidden" name="serviceAccountID" value={serviceAccount.id} />

			{#if errorMessage}
				<ErrorMessage>{errorMessage}</ErrorMessage>
			{/if}

			<TextField size="small" label="Token name" name="name" required autocomplete="off" />
			<TextField
				size="small"
				label="Description"
				name="description"
				required
				autocomplete="off"
			/>
			<TextField size="small" label="Expires at (optional)" name="expiresAt" type="date" />

			<div class="actions">
				<Button type="submit" size="small">Create token</Button>
				<Button size="small" variant="tertiary" onclick={() => history.back()}>
					Cancel
				</Button>
			</div>
		</form>
	{/if}
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		max-width: 600px;
	}

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
		border-radius: 8px;
		overflow-x: auto;
	}

	.token-secret code {
		font-size: var(--ax-font-size-small);
		word-break: break-all;
	}
</style>
