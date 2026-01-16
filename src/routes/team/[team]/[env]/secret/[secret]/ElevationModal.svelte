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
			<Heading as="h1" size="medium">Vis hemmeligheter</Heading>
		</div>
	{/snippet}

	<div class="content">
		<Alert variant="warning" size="small">
			<BodyShort>
				Du er i ferd med å be om tilgang til å se verdiene i hemmeligheten <strong
					>{secretName}</strong
				>. Tilgangen logges og vil automatisk utløpe etter 5 minutter.
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
				label="Hvorfor trenger du å se denne hemmeligheten?"
				description="Skriv en kort begrunnelse (minst 10 tegn)"
				rows={3}
			/>
			{#if reasonTooShort}
				<p class="error-message">Begrunnelsen må være minst 10 tegn</p>
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
			Bekreft og vis hemmeligheter
		</Button>
		<Button variant="tertiary" onclick={handleClose} disabled={isSubmitting}>Avbryt</Button>
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
