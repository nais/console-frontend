<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { isPossiblyInModal } from '$lib/ui/PageModal.svelte';
	import { BodyLong, Button, ErrorMessage, TextField } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	const { ResizeApplicationData } = $derived(data);
	const scaling = $derived(
		$ResizeApplicationData.data?.team?.environment?.application?.resources?.scaling ?? null
	);

	const form = $derived(page.form);

	let min = $state('');
	let max = $state('');

	$effect(() => {
		if (scaling) {
			min = form?.min ?? String(scaling.minInstances);
			max = form?.max ?? String(scaling.maxInstances);
		}
	});
</script>

<form
	method="POST"
	action="/team/{page.params.team}/{page.params.env}/app/{page.params.app}/resize"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'redirect') {
				await goto(result.location, { replaceState: isPossiblyInModal(), invalidateAll: true });
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

	<Button type="submit">Resize application</Button>
</form>

<style>
	form {
		width: 600px;
	}

	form :global(.aksel-form-field) {
		max-width: 400px;
	}

	form :global(> *) {
		margin-bottom: 1rem;
	}
</style>
