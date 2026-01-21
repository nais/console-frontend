<script lang="ts">
	import { graphql } from '$houdini';
	import { Alert, BodyShort, Button, Heading, Modal } from '@nais/ds-svelte-community';
	import { PadlockLockedIcon } from '@nais/ds-svelte-community/icons';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import Textarea from './Textarea.svelte';

	interface Props {
		open?: boolean;
		teamSlug: string;
		environmentName: string;
		secretName: string;
		onSuccess: () => void;
		onClose?: () => void;
	}

	let {
		open = $bindable(false),
		teamSlug,
		environmentName,
		secretName,
		onSuccess,
		onClose
	}: Props = $props();

	let reason = $state('');
	let isSubmitting = $state(false);

	const createElevation = graphql(`
		mutation CreateSecretElevation($input: CreateElevationInput!) {
			createElevation(input: $input) {
				elevation {
					id
					expiresAt
				}
			}
		}
	`);

	const handleSubmit = async () => {
		if (reason.length < 10) {
			return;
		}

		isSubmitting = true;

		await createElevation.mutate({
			input: {
				type: 'SECRET',
				team: teamSlug,
				environmentName: environmentName,
				resourceName: secretName,
				reason: reason,
				durationMinutes: 5
			}
		});

		isSubmitting = false;

		if (!$createElevation.errors) {
			onSuccess();
			handleClose();
		}
	};

	const handleClose = () => {
		open = false;
		reason = '';
		onClose?.();
	};

	const reasonTooShort = $derived(reason.length > 0 && reason.length < 10);
</script>

<Modal bind:open onclose={handleClose} width="medium">
	{#snippet header()}
		<div class="header">
			<PadlockLockedIcon style="font-size: 1.5rem;" />
			<Heading as="h1" size="medium">View secret values</Heading>
		</div>
	{/snippet}

	<div class="content">
		<Alert variant="warning" size="small">
			<BodyShort>
				You are about to request access to view the values in the secret <strong
					>{secretName}</strong
				>. This access will be logged and will automatically expire after 5 minutes.
			</BodyShort>
		</Alert>

		{#if $createElevation.errors}
			<div class="errors">
				<GraphErrors errors={$createElevation.errors} />
			</div>
		{/if}

		<div class="form">
			<Textarea
				bind:text={reason}
				label="Why do you need to view this secret?"
				description="Provide a brief justification (minimum 10 characters)"
				rows={3}
			/>
			{#if reasonTooShort}
				<p class="error-message">Justification must be at least 10 characters</p>
			{/if}
		</div>
	</div>

	{#snippet footer()}
		<Button
			variant="primary"
			onclick={handleSubmit}
			disabled={reason.length < 10 || isSubmitting}
			loading={isSubmitting}
		>
			Confirm and view secrets
		</Button>
		<Button variant="tertiary" onclick={handleClose} disabled={isSubmitting}>Cancel</Button>
	{/snippet}
</Modal>

<style>
	.header {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		min-width: 400px;
	}

	.errors {
		margin-top: var(--ax-space-8);
	}

	.form {
		margin-top: var(--ax-space-8);
	}

	.error-message {
		color: var(--ax-text-danger);
		font-size: var(--ax-font-size-small);
		margin-top: var(--ax-space-4);
	}
</style>
