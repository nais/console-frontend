<script lang="ts">
	import { enhance } from '$app/forms';
	import { BodyLong, Button, ErrorMessage, Textarea, TextField } from '@nais/ds-svelte-community';

	const {
		teamSlug,
		formData,
		onsubmitted
	}: {
		teamSlug?: string;
		formData?: {
			name?: string | null;
			description?: string | null;
			error?: string | null;
		} | null;
		onsubmitted?: () => void;
	} = $props();
</script>

<form
	method="POST"
	use:enhance={() => {
		return async ({ update }) => {
			await update();
			onsubmitted?.();
		};
	}}
>
	<BodyLong style="margin-bottom: 1rem;">
		{#if teamSlug}
			This will create a new service account for <span style="font-weight: bold;">{teamSlug}</span>.
		{:else}
			This will create a new service account.
		{/if}
		<br />
		All service accounts will have read access to most resources, except secrets ... TODO(thokra): replace
		me
	</BodyLong>

	<TextField
		size="small"
		label="Name"
		name="name"
		required
		value={formData?.name ?? ''}
		autocomplete="off"
	/>

	<Textarea
		size="small"
		label="Description"
		name="description"
		required
		value={formData?.description ?? ''}
	/>

	{#if formData?.error}
		<ErrorMessage>{formData.error}</ErrorMessage>
	{/if}

	<Button type="submit">Create service account</Button>
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
