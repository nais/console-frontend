<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { isPossiblyInModal } from '$lib/ui/PageModal.svelte';
	import { Alert, BodyLong, Button, ErrorMessage, TextField } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	const { ResizeApplicationData } = $derived(data);
	const scaling = $derived(
		$ResizeApplicationData.data?.team?.environment?.application?.resources?.scaling ?? null
	);

	const form = $derived(page.form);

	let min = $derived(form?.min ?? scaling?.minInstances ?? 0);
	let max = $derived(form?.max ?? scaling?.maxInstances ?? 0);

	let success = $state(false);
	let successMessage = $state('');
	let closeButtonEl: HTMLButtonElement | undefined = $state();

	const close = async () => {
		await goto(`/team/${page.params.team}/${page.params.env}/app/${page.params.app}`, {
			replaceState: isPossiblyInModal(),
			invalidateAll: true
		});
	};

	$effect(() => {
		if (success) {
			queueMicrotask(() => closeButtonEl?.focus());
		}
	});
</script>

{#if success}
	<div class="wrapper" role="status" aria-live="polite" aria-atomic="true">
		<Alert variant="success" size="small">{successMessage}</Alert>
		<Button variant="tertiary" size="small" onclick={close} bind:ref={closeButtonEl}>Close</Button>
	</div>
{:else}
	<form
		method="POST"
		action="/team/{page.params.team}/{page.params.env}/app/{page.params.app}/resize"
		use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'redirect') {
					successMessage = `Successfully resized application to ${min} - ${max} replicas.`;
					success = true;
				} else if (result.type === 'failure') {
					const { applyAction } = await import('$app/forms');
					await applyAction(result);
				}
			};
		}}
	>
		<BodyLong style="margin-bottom: 1rem;">
			Set the number of replicas for <strong>{page.params.app}</strong> in
			<strong>{page.params.env}</strong>.
		</BodyLong>

		<TextField
			size="small"
			label="Minimum replicas{scaling ? ` (${scaling.minInstances})` : ''}"
			name="min"
			type="number"
			min={0}
			step={1}
			required
			bind:value={min}
		/>

		<TextField
			size="small"
			label="Maximum replicas{scaling ? ` (${scaling.maxInstances})` : ''}"
			name="max"
			type="number"
			min={0}
			step={1}
			required
			bind:value={max}
		/>

		{#if form?.error}
			<ErrorMessage>{form.error}</ErrorMessage>
		{/if}

		<div class="button-row">
			<Button type="submit" size="small">Resize application</Button>
			<Button variant="tertiary" size="small" type="button" onclick={close}>Cancel</Button>
		</div>
	</form>
{/if}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		width: 500px;
		align-items: flex-start;
	}

	form {
		width: 600px;
	}

	form :global(.aksel-form-field) {
		max-width: 400px;
	}

	form :global(> *) {
		margin-bottom: 1rem;
	}

	.button-row {
		display: flex;
		gap: var(--ax-space-8);
		align-items: center;
	}
</style>
